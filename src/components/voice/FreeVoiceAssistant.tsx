"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MicIcon, MicOffIcon, Volume2Icon, VolumeXIcon, SendIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function FreeVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [voiceDisabled, setVoiceDisabled] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      initializeSpeechRecognition();
    } else {
      setError("Speech recognition not supported in this browser. Please use the text input below instead.");
    }
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleUserMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = '';
      let shouldRetry = false;
      
      switch (event.error) {
        case 'network':
          // Immediately disable voice on network error - no retries
          errorMessage = 'Voice recognition requires internet connection. Please use the text input below instead.';
          setVoiceDisabled(true);
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please use the text input below instead.';
          setVoiceDisabled(true);
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please use the text input below instead.';
          setVoiceDisabled(true);
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed. Please use the text input below instead.';
          setVoiceDisabled(true);
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
      }
      
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const handleUserMessage = async (userText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Generate AI response (you can replace this with your own logic)
    const aiResponse = await generateAIResponse(userText);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    
    // Speak the response
    speakText(aiResponse);
  };

  const generateAIResponse = async (userText: string): Promise<string> => {
    const lowerText = userText.toLowerCase();
    
    // Enhanced dental AI responses with more variety
    const responses = {
      // Pain-related responses
      "tooth pain": [
        "Tooth pain can have several causes. It might be due to cavities, gum disease, or tooth sensitivity. I recommend scheduling an appointment with a dentist for proper evaluation.",
        "Tooth pain is often a sign that something needs attention. It could be a cavity, infection, or gum issue. A dentist can diagnose the exact cause and provide treatment.",
        "Persistent tooth pain should be evaluated by a dentist. It could indicate decay, infection, or other dental issues that need professional care."
      ],
      "pain": [
        "Dental pain can vary in intensity and cause. It's important to see a dentist to determine the underlying issue and get appropriate treatment.",
        "Pain in your teeth or gums should not be ignored. A dentist can help identify the cause and provide relief through proper treatment."
      ],
      
      // Cavity-related responses
      "cavity": [
        "Cavities are caused by bacteria that produce acid, which damages tooth enamel. Good oral hygiene, regular brushing, and flossing can help prevent cavities. A dentist can treat existing cavities with fillings.",
        "Cavities develop when bacteria in plaque produce acids that erode tooth enamel. Regular dental checkups and good oral hygiene can prevent them. Existing cavities need professional treatment.",
        "Tooth decay (cavities) occurs when bacteria break down tooth structure. Prevention through proper brushing, flossing, and regular dental visits is key."
      ],
      "decay": [
        "Tooth decay is a progressive condition that can lead to cavities and tooth loss if untreated. Early detection and treatment by a dentist can prevent further damage.",
        "Decay occurs when bacteria produce acids that dissolve tooth enamel. Good oral hygiene and regular dental visits can prevent and treat decay."
      ],
      
      // Gum-related responses
      "gum bleeding": [
        "Bleeding gums often indicate gingivitis or gum disease. This is usually caused by plaque buildup. I recommend improving your oral hygiene routine and seeing a dentist for a professional cleaning.",
        "Bleeding gums are a common sign of gum disease. Proper brushing, flossing, and regular dental cleanings can help reverse early gum disease.",
        "Gum bleeding should not be ignored as it can indicate gum disease. A dentist can assess your gum health and provide appropriate treatment."
      ],
      "gum": [
        "Healthy gums are essential for overall dental health. If you're experiencing gum issues, a dentist can evaluate your gum health and recommend appropriate care.",
        "Gum problems can range from mild gingivitis to more serious periodontal disease. Regular dental checkups can help maintain healthy gums."
      ],
      
      // Bad breath responses
      "bad breath": [
        "Bad breath can be caused by poor oral hygiene, certain foods, or underlying dental issues. Regular brushing, flossing, and tongue cleaning can help. If it persists, consult a dentist.",
        "Persistent bad breath may indicate gum disease, cavities, or other dental issues. A dentist can help identify the cause and recommend treatment.",
        "Bad breath can have various causes including poor oral hygiene, gum disease, or dry mouth. Good oral hygiene and regular dental visits can help."
      ],
      
      // Sensitivity responses
      "tooth sensitivity": [
        "Tooth sensitivity to hot or cold can indicate enamel wear or gum recession. Using a soft-bristled toothbrush and sensitivity toothpaste can help. A dentist can provide professional treatment options.",
        "Sensitive teeth can be caused by exposed dentin, gum recession, or enamel wear. A dentist can recommend treatments like desensitizing agents or restorative procedures.",
        "Tooth sensitivity is common and can often be managed with proper oral care and professional treatment. A dentist can assess the cause and recommend solutions."
      ],
      "sensitive": [
        "Tooth sensitivity can be managed with proper oral care and professional treatment. A dentist can help identify the cause and recommend appropriate solutions.",
        "If you're experiencing tooth sensitivity, it's important to use gentle oral care products and see a dentist for evaluation and treatment options."
      ],
      
      // General dental care
      "brush": [
        "Brushing twice daily with fluoride toothpaste is essential for good oral health. Use a soft-bristled brush and brush for at least two minutes each time.",
        "Proper brushing technique is important for removing plaque and preventing cavities. Brush all surfaces of your teeth and don't forget your tongue."
      ],
      "floss": [
        "Flossing daily helps remove plaque between teeth where your toothbrush can't reach. This is important for preventing cavities and gum disease.",
        "Regular flossing is essential for maintaining healthy gums and preventing cavities between teeth. Make it part of your daily oral hygiene routine."
      ],
      
      // Emergency responses
      "emergency": [
        "Dental emergencies require immediate attention. If you have severe pain, swelling, or trauma, contact a dentist or emergency dental service right away.",
        "For dental emergencies like severe pain, broken teeth, or facial swelling, seek immediate dental care. Don't delay treatment for urgent dental issues."
      ],
      
      // Appointment-related
      "appointment": [
        "I'd be happy to help you book a dental appointment. You can schedule one through our appointment booking system or contact a dentist directly.",
        "Scheduling regular dental appointments is important for maintaining good oral health. Most dentists recommend checkups every six months."
      ],
      "book": [
        "You can book a dental appointment through our online system. Regular checkups are important for maintaining good oral health.",
        "I can help you find available appointment times. Regular dental visits are essential for preventing problems and maintaining healthy teeth and gums."
      ]
    };

    // Find the best matching response
    for (const [keyword, responseArray] of Object.entries(responses)) {
      if (lowerText.includes(keyword)) {
        // Return a random response from the array for variety
        const randomIndex = Math.floor(Math.random() * responseArray.length);
        return responseArray[randomIndex];
      }
    }

    // Default responses for unmatched queries
    const defaultResponses = [
      "I understand you have a dental concern. While I can provide general information, I recommend consulting with a dentist for personalized advice. Would you like me to help you book an appointment?",
      "That's a good question about dental health. For the most accurate advice, I'd recommend scheduling an appointment with a dentist who can examine your specific situation.",
      "I can provide general dental information, but for personalized advice about your specific concern, it's best to consult with a dentist. Would you like help finding an appointment?",
      "Dental health is important, and I'm here to help with general information. For specific concerns, a dentist can provide the best evaluation and treatment recommendations."
    ];

    // Return a random default response
    const randomIndex = Math.floor(Math.random() * defaultResponses.length);
    return defaultResponses[randomIndex];
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      synthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (voiceDisabled) {
      setError('Voice recognition is disabled due to network issues. Please use the text input below.');
      return;
    }
    
    if (recognitionRef.current && !isListening && !isRetrying) {
      setError(null); // Clear any previous errors
      setRetryCount(0); // Reset retry count
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setError('Failed to start speech recognition. Please use the text input below.');
        setVoiceDisabled(true);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserMessage(textInput.trim());
      setTextInput("");
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Voice Assistant Not Supported</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Voice Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicIcon className="w-5 h-5" />
            Free Voice Assistant
            <Badge variant="secondary">No API Key Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking || voiceDisabled}
              size="lg"
              className={`${
                isListening 
                  ? "bg-red-500 hover:bg-red-600" 
                  : voiceDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isListening ? (
                <>
                  <MicOffIcon className="mr-2 h-5 w-5" />
                  Stop Listening
                </>
              ) : voiceDisabled ? (
                <>
                  <MicOffIcon className="mr-2 h-5 w-5" />
                  Voice Disabled
                </>
              ) : (
                <>
                  <MicIcon className="mr-2 h-5 w-5" />
                  Start Listening
                </>
              )}
            </Button>

            {isSpeaking && (
              <Button
                onClick={stopSpeaking}
                variant="outline"
                size="lg"
              >
                <VolumeXIcon className="mr-2 h-5 w-5" />
                Stop Speaking
              </Button>
            )}
          </div>

          {error && (
            <div className="text-center text-red-500 bg-red-50 p-3 rounded-lg">
              <p className="mb-2">{error}</p>
              <Button 
                onClick={startListening}
                variant="outline" 
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            {isListening && "🎤 Listening... Speak now"}
            {isSpeaking && "🔊 Speaking..."}
            {isRetrying && "🔄 Retrying connection..."}
            {voiceDisabled && "❌ Voice disabled due to network issues. Use text input below."}
            {!isListening && !isSpeaking && !isRetrying && !voiceDisabled && "Click the microphone to start"}
          </div>

          {/* Text Input - Primary Method */}
          <div className={`mt-6 pt-6 border-t ${voiceDisabled ? 'bg-green-50 p-4 rounded-lg' : 'bg-blue-50 p-4 rounded-lg'}`}>
            <p className={`text-sm mb-3 text-center ${voiceDisabled ? 'text-green-800 font-medium' : 'text-blue-800 font-medium'}`}>
              {voiceDisabled ? '✅ Use text input below (works without network):' : '💬 Type your dental question below:'}
            </p>
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your dental question here..."
                className="flex-1"
                disabled={isListening || isSpeaking}
              />
              <Button 
                type="submit" 
                disabled={!textInput.trim() || isListening || isSpeaking}
                size="sm"
              >
                <SendIcon className="w-4 h-4" />
              </Button>
            </form>
            
            {/* Example questions */}
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "My tooth hurts",
                  "I have a cavity", 
                  "My gums are bleeding",
                  "I have bad breath",
                  "My teeth are sensitive",
                  "How often should I brush?",
                  "I need an appointment"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setTextInput(example)}
                    className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • {voiceDisabled ? 'Voice is disabled - use text input below' : 'Type your question in the text box below (recommended)'}
          </p>
          <p className="text-sm text-muted-foreground">
            • Or try voice by clicking "Start Listening" (requires internet)
          </p>
          <p className="text-sm text-muted-foreground">
            • The AI will respond with dental advice
          </p>
          <p className="text-sm text-muted-foreground">
            • Responses are spoken aloud automatically
          </p>
          <p className="text-sm text-muted-foreground">
            • {voiceDisabled ? 'Text input works without network issues!' : 'Text input works offline - no API keys needed!'}
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Tips:</p>
            <p className="text-xs text-blue-700 font-medium">
              • Text input always works - no internet required!
            </p>
            <p className="text-xs text-blue-700">
              • Voice requires stable internet connection
            </p>
            <p className="text-xs text-blue-700">
              • Allow microphone access when prompted for voice
            </p>
            <p className="text-xs text-blue-700">
              • Try Chrome or Edge browser for voice recognition
            </p>
            <p className="text-xs text-blue-700">
              • Speak clearly and wait for the "Listening..." indicator
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
