import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const model = formData.get('model') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    let transcript = '';

    if (model === 'local-whisper') {
      // For local processing, we'll use a simple approach
      // In a real implementation, you'd use a local Whisper model
      transcript = await processLocalWhisper(audioFile);
    } else {
      // Use cloud-based transcription
      transcript = await processCloudTranscription(audioFile, model);
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}

async function processLocalWhisper(audioFile: File): Promise<string> {
  // This is a placeholder for local Whisper processing
  // In a real implementation, you'd use a local Whisper model
  // For now, we'll return a mock response
  return "I heard you say something about dental health. Could you please repeat that?";
}

async function processCloudTranscription(audioFile: File, model: string | null): Promise<string> {
  try {
    // Convert audio to base64 for API calls
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // Handle null model or default to groq
    const modelType = model || 'groq-llama3-8b';

    if (modelType.startsWith('groq-')) {
      return await transcribeWithGroq(audioBase64);
    } else if (modelType.startsWith('huggingface-')) {
      return await transcribeWithHuggingFace(audioBase64);
    } else {
      // Fallback to a simple mock response
      return "I heard you speaking. Could you please repeat your question?";
    }
  } catch (error) {
    console.error('Cloud transcription error:', error);
    return "I'm sorry, I couldn't understand what you said. Please try again.";
  }
}

async function transcribeWithGroq(audioBase64: string): Promise<string> {
  try {
    // Note: Groq doesn't have direct speech-to-text API
    // This would need to be implemented with a separate STT service
    // For now, we'll use a mock response
    return "I heard you mention dental concerns. How can I help you today?";
  } catch (error) {
    console.error('Groq transcription error:', error);
    return "I'm having trouble processing your speech. Please try again.";
  }
}

async function transcribeWithHuggingFace(audioBase64: string): Promise<string> {
  try {
    // Hugging Face has speech recognition models
    // This would need to be implemented with their API
    return "I understand you have a dental question. What would you like to know?";
  } catch (error) {
    console.error('Hugging Face transcription error:', error);
    return "I couldn't process your audio. Please try speaking again.";
  }
}
