import Navbar from "@/components/Navbar";
import MinimalistVoiceAssistant from "@/components/voice/MinimalistVoiceAssistant";

export default function VoicePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pt-16 sm:pt-20">
        <MinimalistVoiceAssistant />
      </div>
    </div>
  );
}
