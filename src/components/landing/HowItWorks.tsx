import { SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon, ZapIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 px-6 bg-gradient-to-b from-primary/5 to-background">
      {/* HEADER */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20 mb-6">
          <ZapIcon className="size-4 text-primary" />
          <span className="text-sm font-medium text-primary">Simple Process</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight font-serif">
          <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Three steps to
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            better dental health
          </span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Our streamlined process makes dental care accessible, convenient, and stress-free for
          everyone
        </p>
      </div>

      {/* STEPS */}
      <div className="relative">
        {/* CONNECTION LINE */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent transform -translate-y-1/2 hidden lg:block"></div>

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
          {/* STEP 1 */}
          <div className="relative">
            <div className="relative bg-card rounded-3xl p-8 border border-border hover:border-primary/30 transition-colors duration-300">
              {/* Step Number */}
              <div className="absolute -top-4 left-8 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                1
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Image src="/audio.png" alt="Voice Chat" width={40} height={40} className="w-14" />
              </div>

              <h3 className="text-2xl font-bold mb-4 text-center">Ask Questions</h3>
              <p className="text-muted-foreground text-center leading-relaxed mb-6">
                Chat with our AI assistant about any dental concerns. Get instant answers about
                symptoms, treatments, and oral health tips.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  24/7 Available
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Instant Response
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="relative">
            <div className="relative bg-card rounded-3xl p-8 border border-border hover:border-primary/30 transition-colors duration-300">
              {/* Step Number */}
              <div className="absolute -top-4 left-8 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                2
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Image src="/brain.png" alt="AI Brain" width={40} height={40} className="w-14" />
              </div>

              <h3 className="text-2xl font-bold mb-4 text-center">Get AI Analysis</h3>
              <p className="text-muted-foreground text-center leading-relaxed mb-6">
                Our AI analyzes your input to provide personalized insights, potential diagnoses,
                and recommended next steps for your dental health.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Personalized
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Accurate
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="relative">
            <div className="relative bg-card rounded-3xl p-8 border border-border hover:border-primary/30 transition-colors duration-300">
              {/* Step Number */}
              <div className="absolute -top-4 left-8 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                3
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Image src="/calendar.png" alt="Calendar" width={40} height={40} className="w-14" />
              </div>

              <h3 className="text-2xl font-bold mb-4 text-center">Book & Track</h3>
              <p className="text-muted-foreground text-center leading-relaxed mb-6">
                Easily book appointments with top-rated dentists and track your dental health
                journey, all in one place.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Easy Booking
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Follow-up Care
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="text-center mt-16">
        <SignUpButton mode="modal">
          <Button size="lg">
            <ArrowRightIcon className="mr-2 size-5" />
            Get started now
          </Button>
        </SignUpButton>
      </div>
    </section>
  );
}

export default HowItWorks;