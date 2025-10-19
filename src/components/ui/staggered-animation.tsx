"use client";

import { useEffect, useRef, useState } from "react";

interface StaggeredAnimationProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  distance?: number;
  threshold?: number;
}

export default function StaggeredAnimation({
  children,
  className = "",
  staggerDelay = 100,
  direction = "up",
  distance = 30,
  threshold = 0.1,
}: StaggeredAnimationProps) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate items with stagger
          children.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems(prev => [...prev, index]);
            }, index * staggerDelay);
          });
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [children, staggerDelay, threshold]);

  const getInitialTransform = () => {
    switch (direction) {
      case "up":
        return `translateY(${distance}px)`;
      case "down":
        return `translateY(-${distance}px)`;
      case "left":
        return `translateX(${distance}px)`;
      case "right":
        return `translateX(-${distance}px)`;
      case "fade":
        return "translateY(0px)";
      default:
        return `translateY(${distance}px)`;
    }
  };

  const getFinalTransform = () => {
    switch (direction) {
      case "up":
      case "down":
      case "left":
      case "right":
        return "translateX(0px) translateY(0px)";
      case "fade":
        return "translateY(0px)";
      default:
        return "translateX(0px) translateY(0px)";
    }
  };

  return (
    <div ref={containerRef} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="transition-all ease-out duration-600"
          style={{
            transform: visibleItems.includes(index) ? getFinalTransform() : getInitialTransform(),
            opacity: visibleItems.includes(index) ? 1 : direction === "fade" ? 0 : 0.7,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}


