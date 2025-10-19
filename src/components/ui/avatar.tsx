"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./base-avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-12 w-12",
  xl: "h-16 w-16"
};

export default function UserAvatar({ 
  src, 
  alt = "User", 
  fallback = "U", 
  className,
  size = "md" 
}: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={src || undefined} alt={alt} />
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}