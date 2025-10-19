// Groq API integration for real-time LLM inference
export class GroqClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
  }

  async generateResponse(message: string, model: string = 'llama-3.1-8b-instant'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not provided');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `You are a friendly dental assistant AI. You ONLY answer questions about dental health, oral hygiene, and dental procedures. Keep responses conversational and under 150 words. If asked about non-dental topics (like weight, height, general health), politely redirect to dental health or suggest consulting a healthcare professional. Always recommend seeing a dentist for specific concerns.`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error response:', errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to generate response from Groq');
    }
  }

  async *generateStreamingResponse(message: string, model: string = 'llama-3.1-8b-instant'): AsyncGenerator<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not provided');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `You are a friendly dental assistant AI. You ONLY answer questions about dental health, oral hygiene, and dental procedures. Keep responses conversational and under 150 words. If asked about non-dental topics (like weight, height, general health), politely redirect to dental health or suggest consulting a healthcare professional. Always recommend seeing a dentist for specific concerns.`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq streaming API error response:', errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Groq streaming error:', error);
      throw new Error('Failed to generate streaming response from Groq');
    }
  }
}

// Free model configurations
export const FREE_MODELS = {
  'groq-llama3-8b': {
    name: 'Groq Llama 3 8B',
    provider: 'Groq',
    speed: 'Ultra Fast',
    description: 'Fast, efficient model for real-time responses'
  },
  'groq-mixtral-8x7b': {
    name: 'Groq Mixtral 8x7B',
    provider: 'Groq', 
    speed: 'Fast',
    description: 'High-quality responses with good reasoning'
  },
  'huggingface-zephyr': {
    name: 'Hugging Face Zephyr',
    provider: 'Hugging Face',
    speed: 'Medium',
    description: 'Open-source model with good performance'
  },
  'local-whisper': {
    name: 'Local Whisper',
    provider: 'Browser',
    speed: 'Fast',
    description: 'Runs locally in your browser'
  }
};

export const groqClient = new GroqClient();
