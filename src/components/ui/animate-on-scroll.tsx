"use client";

import { useEffect, useRef, useState } from "react";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  distance?: number;
  threshold?: number;
}

export default function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  duration = 600,
  direction = "up",
  distance = 50,
  threshold = 0.1,
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay, threshold]);

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
    <div
      ref={elementRef}
      className={`transition-all ease-out ${className}`}
      style={{
        transform: isVisible ? getFinalTransform() : getInitialTransform(),
        opacity: isVisible ? 1 : direction === "fade" ? 0 : 0.7,
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}


