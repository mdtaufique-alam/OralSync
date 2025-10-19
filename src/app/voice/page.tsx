import Navbar from "@/components/Navbar";
import MinimalistVoiceAssistant from "@/components/voice/MinimalistVoiceAssistant";

export default function VoicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <MinimalistVoiceAssistant />
      </div>
    </div>
  );
}
