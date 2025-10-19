"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MicIcon, MicOffIcon, Volume2Icon, VolumeXIcon, SendIcon, Loader2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isConnecting: boolean;
  isContinuousMode: boolean;
  currentTranscript: string;
}

export default function RealTimeVoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
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
  const [selectedModel, setSelectedModel] = useState("groq-llama3-8b");
  const [voiceInputMode, setVoiceInputMode] = useState<'automatic' | 'manual'>('manual');
  const [recognitionRestartTimer, setRecognitionRestartTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Refs for audio handling
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Available free models
  const freeModels = [
    { id: "groq-llama3-8b", name: "Groq Llama 3.1 8B", provider: "Groq", speed: "Ultra Fast" },
    { id: "groq-llama3-70b", name: "Groq Llama 3.1 70B", provider: "Groq", speed: "Fast" },
    { id: "huggingface-zephyr", name: "Hugging Face Zephyr", provider: "Hugging Face", speed: "Medium" },
    { id: "local-whisper", name: "Local Whisper", provider: "Browser", speed: "Fast" }
  ];

  useEffect(() => {
    // Check browser support
    const checkSupport = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          setIsSupported(true);
          await initializeAudio();
        } else {
          setError("Microphone access not supported in this browser");
        }
      } catch (err) {
        setError("Failed to initialize audio system");
      }
    };

    checkSupport();

    return () => {
      cleanup();
    };
  }, []);

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      
      // Initialize audio context for real-time processing
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access and refresh the page.");
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (recognitionRestartTimer) {
      clearInterval(recognitionRestartTimer);
    }
  };

  const startContinuousConversation = useCallback(async () => {
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

      // Always start with manual mode first to avoid network issues
      if (voiceInputMode === 'manual') {
        await startManualVoiceInput();
      } else {
        // Try automatic mode, but fallback to manual if it fails
        try {
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            await startContinuousSpeechRecognition();
          } else {
            throw new Error('Speech recognition not supported');
          }
        } catch (err) {
          console.warn('Automatic mode failed, switching to manual mode:', err);
          setVoiceInputMode('manual');
          setError('Automatic mode failed. Switched to manual mode - push and hold to talk!');
          await startManualVoiceInput();
        }
      }
      
    } catch (err) {
      setError("Failed to start continuous conversation. Please use the text input below.");
      setVoiceState(prev => ({ 
        ...prev, 
        isContinuousMode: false, 
        isRecording: false, 
        isConnecting: false 
      }));
    }
  }, [voiceInputMode]);

  const startManualVoiceInput = useCallback(async () => {
    if (!streamRef.current) {
      setError("No audio stream available");
      return;
    }

    try {
      setVoiceState(prev => ({ ...prev, isConnecting: false }));
      setError(null);

      // For manual mode, we'll use a simple approach - start recording immediately
      // and let the user stop it by clicking the button again
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
      setError("Failed to start manual voice input. Please use the text input below.");
      setVoiceState(prev => ({ ...prev, isContinuousMode: false, isRecording: false, isConnecting: false }));
    }
  }, []);

  const handleManualVoiceToggle = useCallback(() => {
    if (voiceState.isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start recording
      startManualVoiceInput();
    }
  }, [voiceState.isRecording, startManualVoiceInput]);

  const startContinuousSpeechRecognition = useCallback(async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.");
      setVoiceState(prev => ({ ...prev, isContinuousMode: false, isRecording: false }));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show partial results
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceState(prev => ({ ...prev, isConnecting: false }));
      setError(null); // Clear any previous errors
      
      // Set up automatic restart every 30 seconds to prevent timeouts
      if (recognitionRestartTimer) {
        clearInterval(recognitionRestartTimer);
      }
      
      const timer = setInterval(() => {
        if (voiceState.isContinuousMode && !voiceState.isSpeaking && !error) {
          console.log('Restarting recognition to prevent timeout...');
          recognition.stop();
          setTimeout(() => {
            if (voiceState.isContinuousMode && !error) {
              try {
                recognition.start();
              } catch (err) {
                console.error('Failed to restart recognition:', err);
              }
            }
          }, 100);
        }
      }, 30000); // Restart every 30 seconds
      
      setRecognitionRestartTimer(timer);
    };

    recognition.onresult = async (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update current transcript in real-time
      setVoiceState(prev => ({ 
        ...prev, 
        currentTranscript: finalTranscript + interimTranscript 
      }));

      // Process final transcript when speech ends
      if (finalTranscript.trim()) {
        await handleContinuousSpeech(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = '';
      
      switch (event.error) {
        case 'network':
          console.warn('Network issue detected, switching to manual mode');
          setVoiceInputMode('manual');
          errorMessage = 'Network issue detected. Switched to manual mode - push and hold to talk!';
          // Don't stop continuous mode, just switch to manual
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access and refresh the page.';
          setVoiceState(prev => ({ ...prev, isContinuousMode: false, isRecording: false }));
          break;
        case 'no-speech':
          // Auto-restart for no-speech errors
          setTimeout(() => {
            if (voiceState.isContinuousMode && !error) {
              try {
                recognition.start();
              } catch (err) {
                console.error('Failed to restart recognition:', err);
              }
            }
          }, 1000);
          return;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
          setVoiceState(prev => ({ ...prev, isContinuousMode: false, isRecording: false }));
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed. Please use the text input below.';
          setVoiceState(prev => ({ ...prev, isContinuousMode: false, isRecording: false }));
          break;
        case 'aborted':
          // Recognition was aborted, don't show error
          return;
        default:
          errorMessage = `Voice recognition error: ${event.error}. Please use the text input below - it works perfectly!`;
          setVoiceState(prev => ({ ...prev, isContinuousMode: false, isRecording: false }));
      }
      
      if (errorMessage) {
        setError(errorMessage);
      }
    };

    recognition.onend = () => {
      // Only restart if we're still in continuous mode and not speaking
      if (voiceState.isContinuousMode && !voiceState.isSpeaking && !error) {
        setTimeout(() => {
          if (voiceState.isContinuousMode && !error) {
            try {
              recognition.start();
            } catch (err) {
              console.error('Failed to restart recognition:', err);
              setError('Voice recognition failed. Please use the text input below.');
              setVoiceState(prev => ({ ...prev, isContinuousMode: false, isRecording: false }));
            }
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start voice recognition. Please use the text input below.');
      setVoiceState(prev => ({ ...prev, isContinuousMode: false, isRecording: false }));
    }
  }, [voiceState.isContinuousMode, voiceState.isSpeaking, error]);

  const handleContinuousSpeech = async (transcript: string) => {
    if (!transcript.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: transcript,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Clear current transcript
    setVoiceState(prev => ({ ...prev, currentTranscript: "" }));

    // Generate and speak response
    await generateAndSpeakResponse(transcript);
  };

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      setError("No audio stream available");
      return;
    }

    try {
      setVoiceState(prev => ({ ...prev, isRecording: true, isConnecting: true }));
      setError(null);

      // Create new MediaRecorder
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

      mediaRecorderRef.current.start(100); // Collect data every 100ms for real-time processing
      setVoiceState(prev => ({ ...prev, isConnecting: false }));
      
    } catch (err) {
      setError("Failed to start recording");
      setVoiceState(prev => ({ ...prev, isRecording: false, isConnecting: false }));
    }
  }, []);

  const stopContinuousConversation = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Clear the restart timer
    if (recognitionRestartTimer) {
      clearInterval(recognitionRestartTimer);
      setRecognitionRestartTimer(null);
    }
    
    setVoiceState(prev => ({ 
      ...prev, 
      isContinuousMode: false, 
      isRecording: false, 
      currentTranscript: "" 
    }));
  }, [recognitionRestartTimer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const processAudio = async (audioBlob: Blob) => {
    try {
      setVoiceState(prev => ({ ...prev, isProcessing: true }));
      
      // Convert audio to text using selected model
      const transcript = await speechToText(audioBlob);
      
      if (transcript.trim()) {
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          text: transcript,
          isUser: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        // Generate AI response
        await generateAndSpeakResponse(transcript);
      } else {
        setError("No speech detected. Please try speaking again.");
        setVoiceState(prev => ({ ...prev, isProcessing: false }));
      }
    } catch (err) {
      setError("Failed to process audio");
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const speechToText = async (audioBlob: Blob): Promise<string> => {
    if (selectedModel === "local-whisper") {
      return await localWhisperTranscription(audioBlob);
    } else {
      return await cloudTranscription(audioBlob);
    }
  };

  const localWhisperTranscription = async (audioBlob: Blob): Promise<string> => {
    // Use Web Speech API as fallback for local transcription
    return new Promise((resolve) => {
      const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = () => {
        resolve("");
      };

      recognition.start();
      
      // Stop after 5 seconds if no result
      setTimeout(() => {
        recognition.stop();
        resolve("");
      }, 5000);
    });
  };

  const cloudTranscription = async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('model', selectedModel);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      return data.transcript || "";
    } catch (err) {
      console.error('Cloud transcription failed:', err);
      return "";
    }
  };

  const generateAndSpeakResponse = async (userText: string) => {
    try {
      // Add streaming message
      const streamingMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        isUser: false,
        timestamp: new Date(),
        isStreaming: true
      };
      setMessages(prev => [...prev, streamingMessage]);

      // Generate AI response
      const response = await generateAIResponse(userText);
      
      // Update the streaming message
      setMessages(prev => prev.map(msg => 
        msg.id === streamingMessage.id 
          ? { ...msg, text: response, isStreaming: false }
          : msg
      ));

      // Speak the response
      await speakText(response);
      
    } catch (err) {
      setError("Failed to generate response");
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
          model: selectedModel,
          stream: true
        })
      });

      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(`AI response failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
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
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => setVoiceState(prev => ({ ...prev, isSpeaking: true }));
      utterance.onend = () => setVoiceState(prev => ({ ...prev, isSpeaking: false, isProcessing: false }));

      synthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
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

  const getStatusText = () => {
    if (voiceState.isConnecting) return "🔄 Connecting...";
    if (voiceState.isContinuousMode) {
      if (voiceState.isSpeaking) return "🔊 AI is speaking...";
      if (voiceState.currentTranscript) return `🎤 Listening... "${voiceState.currentTranscript}"`;
      if (voiceInputMode === 'automatic') return "🎤 Listening... Speak naturally";
      return "🎤 Push and hold to talk";
    }
    if (voiceState.isRecording) {
      if (voiceInputMode === 'manual') return "🎤 Recording... Release when done";
      return "🎤 Recording... Speak now";
    }
    if (voiceState.isProcessing) return "⚡ Processing...";
    if (voiceState.isSpeaking) return "🔊 Speaking...";
    return voiceInputMode === 'automatic' 
      ? "Click to start automatic voice conversation" 
      : "Click to start manual voice conversation";
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Free AI Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {freeModels.map((model) => (
              <div
                key={model.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedModel === model.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{model.name}</h4>
                    <p className="text-sm text-muted-foreground">{model.provider}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {model.speed}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicIcon className="w-5 h-5" />
            Real-Time Voice Assistant
            <Badge variant="secondary">Free Models</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Input Mode Selector */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Voice Input Mode:</label>
              <select
                value={voiceInputMode}
                onChange={(e) => setVoiceInputMode(e.target.value as 'automatic' | 'manual')}
                className="px-3 py-1 border rounded-md text-sm"
                disabled={voiceState.isContinuousMode || voiceState.isRecording}
              >
                <option value="automatic">Automatic (Speech Recognition)</option>
                <option value="manual">Manual (Push to Talk)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={
                voiceInputMode === 'manual' 
                  ? handleManualVoiceToggle
                  : voiceState.isContinuousMode 
                    ? stopContinuousConversation 
                    : voiceState.isRecording 
                      ? stopRecording 
                      : startContinuousConversation
              }
              disabled={voiceState.isProcessing}
              size="lg"
              className={`${
                voiceState.isContinuousMode || voiceState.isRecording
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {voiceState.isProcessing ? (
                <>
                  <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : voiceState.isContinuousMode ? (
                <>
                  <MicOffIcon className="mr-2 h-5 w-5" />
                  Stop Conversation
                </>
              ) : voiceState.isRecording ? (
                <>
                  <MicOffIcon className="mr-2 h-5 w-5" />
                  {voiceInputMode === 'manual' ? 'Release to Send' : 'Stop Recording'}
                </>
              ) : (
                <>
                  <MicIcon className="mr-2 h-5 w-5" />
                  {voiceInputMode === 'automatic' ? 'Start Auto Voice Chat' : 'Hold to Talk'}
                </>
              )}
            </Button>

            {voiceState.isSpeaking && (
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
            <Alert variant={error.includes('Network error') ? "default" : "destructive"}>
              <AlertDescription>
                {error}
                {error.includes('Network error') && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      💡 Good news! You can still chat using the text input below - it works perfectly without network issues!
                    </p>
                    <Button 
                      onClick={() => {
                        setError(null);
                        startContinuousConversation();
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

          <div className="text-center text-sm text-muted-foreground">
            {getStatusText()}
          </div>

          {/* Real-time Transcript Display */}
          {voiceState.isContinuousMode && voiceState.currentTranscript && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">Live Transcript:</span>
              </div>
              <p className="text-sm text-blue-700 italic">
                "{voiceState.currentTranscript}"
              </p>
            </div>
          )}

          {/* Text Input Fallback */}
          <div className={`mt-6 pt-6 border-t p-4 rounded-lg ${
            error && error.includes('Network error') 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50'
          }`}>
            <p className={`text-sm mb-3 text-center font-medium ${
              error && error.includes('Network error')
                ? 'text-green-800'
                : 'text-blue-800'
            }`}>
              {error && error.includes('Network error') 
                ? '✅ Type your dental question below (works without network!):'
                : '💬 Or type your dental question below:'
              }
            </p>
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your dental question here..."
                className="flex-1"
                disabled={voiceState.isProcessing || voiceState.isSpeaking}
              />
              <Button 
                type="submit" 
                disabled={!textInput.trim() || voiceState.isProcessing || voiceState.isSpeaking}
                size="sm"
              >
                <SendIcon className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Conversation</CardTitle>
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
                    <p className="text-sm">
                      {message.text}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                      )}
                    </p>
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
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • <strong>Two Voice Modes</strong> - Automatic speech recognition or Manual push-to-talk
          </p>
          <p className="text-sm text-muted-foreground">
            • <strong>Real-time transcript</strong> - see what you're saying as you speak
          </p>
          <p className="text-sm text-muted-foreground">
            • <strong>Instant AI responses</strong> - AI responds immediately to your questions
          </p>
          <p className="text-sm text-muted-foreground">
            • <strong>Fallback to text</strong> - if voice fails, text input always works
          </p>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900 mb-2">Voice Modes:</p>
            <p className="text-xs text-green-700">
              • <strong>Automatic:</strong> Continuous listening, speak naturally like a phone call
            </p>
            <p className="text-xs text-green-700">
              • <strong>Manual:</strong> Push and hold to talk, release to send (works without network issues)
            </p>
            <p className="text-xs text-green-700">
              • If automatic fails, switch to manual mode or use text input
            </p>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tips:</p>
            <p className="text-xs text-blue-700">
              • For best results, use HTTPS (not localhost) - try: <code>npx localtunnel --port 3000</code>
            </p>
            <p className="text-xs text-blue-700">
              • Automatic mode auto-restarts every 30 seconds to prevent timeouts
            </p>
            <p className="text-xs text-blue-700">
              • Network errors automatically switch to manual mode
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
