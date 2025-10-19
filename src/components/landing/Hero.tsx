"use client";

import { SignUpButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { CalendarIcon, MicIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

function Hero() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Enable scrolling immediately and trigger animation
    document.body.style.overflow = 'auto';
    setIsScrolled(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-gradient-to-br from-background via-muted/5 to-primary/5">
      {/* Simplified gradient orbs - removed blur effects */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-primary/8 to-primary/3 rounded-full" />

      <div className="relative z-10 w-full px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT CONTENT - Avatar */}
            <div className={`relative flex justify-center items-center transition-all duration-700 ease-out ${isScrolled ? 'justify-start' : 'justify-center'}`}>
              <Image
                src={"/hero.png"}
                alt="OralSync AI"
                width={600}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* RIGHT CONTENT - Text */}
            <div className={`space-y-10 transition-all duration-700 ease-out ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="space-y-6">
                {/* BADGE */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-primary">
                    AI-Powered Dental Assistant
                  </span>
                </div>

                {/* MAIN HEADING */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-serif">
                  <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                    Your dental
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    questions
                  </span>
                  <br />
                  <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                    answered instantly
                  </span>
                </h1>

                {/* SUBTITLE */}
                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl font-medium">
                  Chat with our AI dental assistant for instant advice, book smart appointments, and
                  get personalized care recommendations. Available 24/7.
                </p>
              </div>

              {/* CTA BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <SignUpButton mode="modal">
                  <Button size={"lg"}>
                    <MicIcon className="mr-2 size-5" />
                    Try voice agent
                  </Button>
                </SignUpButton>

                <SignUpButton mode="modal">
                  <Button size={"lg"} variant={"outline"}>
                    <CalendarIcon className="mr-2 size-5" />
                    Book appointment
                  </Button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;