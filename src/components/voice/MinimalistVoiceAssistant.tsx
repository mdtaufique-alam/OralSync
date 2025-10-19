"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { 
  MicIcon, 
  MicOffIcon, 
  VolumeXIcon, 
  Volume2Icon,
  Loader2Icon, 
  SendIcon,
  MessageSquareIcon,
  SparklesIcon
} from 'lucide-react';

interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isConnecting: boolean;
  isContinuousMode: boolean;
  currentTranscript: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function MinimalistVoiceAssistant() {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    isProcessing: false,
    isSpeaking: false,
    isConnecting: false,
    isContinuousMode: false,
    currentTranscript: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  
  // Refs for audio handling
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Check browser support
    const checkSupport = async () => {
      try {
        // Check for speech recognition
        const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        
        // Check for media devices
        const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
        
        // Check for speech synthesis
        const hasSpeechSynthesis = 'speechSynthesis' in window;
        
        if (hasSpeechRecognition && hasMediaDevices && hasSpeechSynthesis) {
          setIsSupported(true);
          
          // Get microphone access
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
          } catch (err) {
            console.error('Microphone access denied:', err);
            setError('Microphone access is required for voice features. Please allow microphone access and refresh the page.');
          }
        } else {
          setIsSupported(false);
          setError('Your browser does not support all required features for voice processing.');
        }
      } catch (err) {
        console.error('Support check failed:', err);
        setIsSupported(false);
        setError('Failed to initialize voice features. Please refresh the page.');
      }
    };

    checkSupport();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startVoiceInput = useCallback(async () => {
    if (!streamRef.current) {
      setError("No audio stream available");
      return;
    }

    try {
      setVoiceState(prev => ({ 
        ...prev, 
        isContinuousMode: true, 
        isRecording: true, 
        isConnecting: true,
        currentTranscript: ""
      }));
      setError(null);

      // Use manual recording mode (push to talk)
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setVoiceState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      
    } catch (err) {
      setError("Failed to start voice input. Please use the text input below.");
      setVoiceState(prev => ({ 
        ...prev, 
        isContinuousMode: false, 
        isRecording: false, 
        isConnecting: false 
      }));
    }
  }, []);

  const stopVoiceInput = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setVoiceState(prev => ({ ...prev, isRecording: false }));
  }, []);

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('model', 'groq-llama3-8b'); // Add model parameter

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const { transcript } = await response.json();
      
      if (transcript && transcript.trim()) {
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          text: transcript.trim(),
          isUser: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        // Generate AI response
        await generateAndSpeakResponse(transcript.trim());
      } else {
        setError("No speech detected. Please try again.");
        setVoiceState(prev => ({ ...prev, isProcessing: false }));
      }
    } catch (err) {
      console.error('Audio processing failed:', err);
      setError("Failed to process audio. Please try again.");
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const generateAndSpeakResponse = async (userText: string) => {
    console.log('generateAndSpeakResponse called with:', userText);
    try {
      // Add AI message placeholder
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        isUser: false,
        timestamp: new Date(),
        isStreaming: true
      };
      setMessages(prev => [...prev, aiMessage]);

      const response = await generateAIResponse(userText);
      console.log('AI response received:', response);
      
      // Update AI message with final response
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessage.id 
          ? { ...msg, text: response, isStreaming: false }
          : msg
      ));

      // Speak the response
      console.log('About to call speakText...');
      await speakText(response);
    } catch (err) {
      console.error('Response generation failed:', err);
      setError("Failed to generate response. Please try again.");
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const generateAIResponse = async (userText: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          model: 'groq-llama3-8b', // Fixed model
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullResponse += data.content;
                // Update streaming message in real-time
                setMessages(prev => prev.map(msg => 
                  msg.isStreaming 
                    ? { ...msg, text: fullResponse }
                    : msg
                ));
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }

      return fullResponse;
    } catch (err) {
      console.error('AI generation failed:', err);
      // Fallback to a simple response
      return "I'm sorry, I couldn't process your request right now. Please try again or use the text input below.";
    }
  };

  const speakText = async (text: string) => {
    console.log('speakText called with:', text);
    console.log('isTTSEnabled:', isTTSEnabled);
    
    // Only speak if TTS is enabled
    if (!isTTSEnabled) {
      console.log('TTS is disabled, not speaking');
      setVoiceState(prev => ({ ...prev, isSpeaking: false, isProcessing: false }));
      return;
    }

    if ('speechSynthesis' in window) {
      console.log('Speech synthesis available, speaking...');
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        console.log('Speech started');
        setVoiceState(prev => ({ ...prev, isSpeaking: true }));
      };
      utterance.onend = () => {
        console.log('Speech ended');
        setVoiceState(prev => ({ ...prev, isSpeaking: false, isProcessing: false }));
      };

      synthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    } else {
      console.log('Speech synthesis not available');
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setVoiceState(prev => ({ ...prev, isSpeaking: false, isProcessing: false }));
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      setVoiceState(prev => ({ ...prev, isProcessing: true }));
      await generateAndSpeakResponse(textInput.trim());
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
            Your browser doesn't support real-time voice processing. Please use Chrome, Edge, or Safari.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Left Side - DentWise Branding & Voice Control */}
        <div className="flex flex-col justify-center space-y-8">
          {/* DentWise Logo & Branding */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className={`w-24 h-24 mx-auto rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                voiceState.isRecording || voiceState.isProcessing || voiceState.isSpeaking
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-border bg-card'
              }`}>
                <Image 
                  src="/logo.png" 
                  alt="DentWise Logo" 
                  width={48} 
                  height={48} 
                  className={`transition-all duration-300 ${
                    voiceState.isRecording || voiceState.isProcessing || voiceState.isSpeaking
                      ? 'scale-110'
                      : 'scale-100'
                  }`}
                />
              </div>
              
              {/* Animated ring when active */}
              {(voiceState.isRecording || voiceState.isProcessing || voiceState.isSpeaking) && (
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping"></div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">DentWise AI</h1>
              <p className="text-muted-foreground">AI-Powered Dental Assistant</p>
              <Badge variant="secondary" className="mt-2">
                <SparklesIcon className="w-3 h-3 mr-1" />
                Powered by Groq
              </Badge>
            </div>
          </div>

          {/* Status & Voice Control */}
          <div className="space-y-6">
            {/* Status Display */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                voiceState.isRecording
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : voiceState.isProcessing
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : voiceState.isSpeaking
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {voiceState.isConnecting && (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                )}
                {voiceState.isRecording && (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Recording... Hold to talk
                  </>
                )}
                {voiceState.isProcessing && (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    Processing your question...
                  </>
                )}
                {voiceState.isSpeaking && (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    AI is speaking...
                  </>
                )}
                {!voiceState.isRecording && !voiceState.isProcessing && !voiceState.isSpeaking && (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Ready to help with your dental questions
                  </>
                )}
              </div>
            </div>

            {/* Voice Button */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                onClick={voiceState.isRecording ? stopVoiceInput : startVoiceInput}
                disabled={voiceState.isProcessing || voiceState.isSpeaking}
                size="lg"
                className={`w-80 h-14 text-base font-medium transition-all duration-300 ${
                  voiceState.isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25" 
                    : voiceState.isProcessing
                    ? "bg-yellow-500 cursor-not-allowed text-white"
                    : voiceState.isSpeaking
                    ? "bg-blue-500 cursor-not-allowed text-white"
                    : "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                }`}
              >
                {voiceState.isProcessing ? (
                  <>
                    <Loader2Icon className="mr-3 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : voiceState.isSpeaking ? (
                  <>
                    <VolumeXIcon className="mr-3 h-5 w-5" />
                    AI Speaking...
                  </>
                ) : voiceState.isRecording ? (
                  <>
                    <MicOffIcon className="mr-3 h-5 w-5" />
                    Release to Send
                  </>
                ) : (
                  <>
                    <MicIcon className="mr-3 h-5 w-5" />
                    Start Voice Chat
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Hold to talk • Release to send
              </p>
            </div>

            {/* Stop Speaking Button */}
            {voiceState.isSpeaking && (
              <div className="flex justify-center">
                <Button
                  onClick={stopSpeaking}
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <VolumeXIcon className="mr-2 h-4 w-4" />
                  Stop Speaking
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="flex flex-col h-full">
          <Card className="flex-1 flex flex-col h-[500px]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center gap-2">
                  <MessageSquareIcon className="w-5 h-5" />
                  Live Consultation Transcript
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('TTS toggle clicked, current state:', isTTSEnabled);
                    setIsTTSEnabled(!isTTSEnabled);
                    // Test TTS immediately
                    if (!isTTSEnabled) {
                      speakText("TTS is now enabled");
                    }
                  }}
                  className={`p-2 ${isTTSEnabled ? 'text-primary' : 'text-muted-foreground'}`}
                  title={isTTSEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
                >
                  {isTTSEnabled ? (
                    <Volume2Icon className="w-4 h-4" />
                  ) : (
                    <VolumeXIcon className="w-4 h-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-6">
              {/* Chat Messages */}
              <div 
                className="flex-1 overflow-y-auto mb-6 space-y-4"
                style={{ maxHeight: '350px' }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <MessageSquareIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Start Your Consultation</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Click the voice button to start talking, or type your dental question below.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.text}
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                          )}
                        </p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {/* Scroll target for auto-scroll */}
                <div ref={messagesEndRef} className="h-0" />
              </div>

              {/* TTS Test Button */}
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('Testing TTS...');
                    speakText("This is a test of the text to speech functionality");
                  }}
                  className="w-full"
                >
                  🔊 Test TTS
                </Button>
              </div>

              {/* Text Input */}
              <div className="space-y-3">
                <form onSubmit={handleTextSubmit} className="flex gap-3">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Ask your dental question here..."
                    className="flex-1 h-12 text-base"
                    disabled={voiceState.isProcessing || voiceState.isSpeaking}
                  />
                  <Button 
                    type="submit" 
                    disabled={!textInput.trim() || voiceState.isProcessing || voiceState.isSpeaking}
                    size="lg"
                    className="h-12 px-6"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </form>
                
                <p className="text-xs text-muted-foreground text-center">
                  💡 <strong>Tip:</strong> Use the voice button for hands-free conversation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant={error.includes('Network error') ? "default" : "destructive"} className="mt-8">
          <AlertDescription>
            {error}
            {error.includes('Network error') && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium mb-2">
                  💡 Good news! You can still chat using the text input - it works perfectly without network issues!
                </p>
                <Button 
                  onClick={() => {
                    setError(null);
                    startVoiceInput();
                  }}
                  variant="outline" 
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  🔄 Try Voice Again
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
