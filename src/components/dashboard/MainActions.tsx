import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { MessageSquareIcon, CalendarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MainActions() {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-8">
      {/* AI Voice Assistant */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardContent className="relative p-6 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Image src="/audio.png" alt="Voice AI" width={28} height={28} className="w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">AI Voice Assistant</h3>
              <p className="text-sm text-muted-foreground">Get instant dental advice through voice calls</p>
            </div>
          </div>

          <div className="space-y-3 flex-grow">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">24/7 availability</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Professional dental guidance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Instant pain relief advice</span>
            </div>
          </div>

          <Link
            href="/voice"
            className={buttonVariants({
              variant: "default",
              className:
                "w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
            })}
          >
            <MessageSquareIcon className="mr-2 h-4 w-4" />
            Start Voice Call
          </Link>
        </CardContent>
      </Card>

      {/* Book Appointment */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardContent className="relative p-6 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Image src="/calendar.png" alt="Calendar" width={28} height={28} className="w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Book Appointment</h3>
              <p className="text-sm text-muted-foreground">Schedule with verified dentists in your area</p>
            </div>
          </div>

          <div className="space-y-3 flex-grow">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Verified dental professionals</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Flexible scheduling</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Instant confirmations</span>
            </div>
          </div>

          <Link href="/appointments">
            <Button
              variant="outline"
              className="w-full mt-4 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-semibold py-2.5 rounded-xl transition-all duration-300"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
