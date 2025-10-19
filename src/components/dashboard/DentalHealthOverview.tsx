import { getUserAppointmentStats } from "@/lib/actions/appointments";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BrainIcon, MessageSquareIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "../ui/button";

async function DentalHealthOverview() {
  const appointmentStats = await getUserAppointmentStats();
  const user = await currentUser();

  return (
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <BrainIcon className="size-5 text-primary" />
          Your Dental Health
        </CardTitle>
        <CardDescription>Keep track of your dental care journey</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            Member since {format(new Date(user?.createdAt!), "MMM '25")}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <div className="text-3xl font-bold text-primary mb-2">
              {appointmentStats.completedAppointments}
            </div>
            <div className="text-sm font-medium text-primary">Completed Visits</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <div className="text-3xl font-bold text-primary mb-2">
              {appointmentStats.totalAppointments}
            </div>
            <div className="text-sm font-medium text-primary">Total Appointments</div>
          </div>
        </div>

         <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
           <div className="flex items-center gap-3 mb-3">
             <div className="size-6 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
               <MessageSquareIcon className="size-3 text-primary" />
             </div>
             <h4 className="font-semibold text-primary">Ready to get started?</h4>
           </div>
           <p className="text-sm text-muted-foreground mb-3">
             Book your first appointment or try our AI voice assistant.
           </p>
           <div className="flex gap-2">
             <Link href="/voice" className="flex-1">
               <Button size="sm" className="bg-primary hover:bg-primary/90 w-full">
                 Try AI Assistant
               </Button>
             </Link>
             <Link href="/appointments" className="flex-1">
               <Button size="sm" variant="outline" className="w-full">
                 Book Now
               </Button>
             </Link>
           </div>
         </div>
      </CardContent>
    </Card>
  );
}

export default DentalHealthOverview;
