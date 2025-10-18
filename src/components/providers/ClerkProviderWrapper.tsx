"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export default function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#e78a53",
          colorBackground: "#f3f4f6",
          colorText: "#111827",
          colorTextSecondary: "#6b7280",
          colorInputBackground: "#f3f4f6",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
