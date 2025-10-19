import { NextRequest, NextResponse } from 'next/server';
import { groqClient } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const { message, model, stream } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    if (stream) {
      return new Response(createStreamingResponse(message, model), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const response = await generateResponse(message, model);
      return NextResponse.json({ response });
    }
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}

function createStreamingResponse(message: string, model: string) {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      try {
        // Use Groq for real streaming if available, otherwise fallback to chunked response
        if (model.startsWith('groq-') && process.env.GROQ_API_KEY) {
          let groqModel = 'llama-3.1-8b-instant'; // Default model
          if (model === 'groq-llama3-8b') {
            groqModel = 'llama-3.1-8b-instant';
          } else if (model === 'groq-llama3-70b') {
            groqModel = 'llama-3.1-70b-versatile';
          }
          console.log('Using Groq model:', groqModel);
          const stream = groqClient.generateStreamingResponse(message, groqModel);
          
          for await (const chunk of stream) {
            const data = {
              content: chunk,
              done: false
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          }
          
          // Send final done signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '', done: true })}\n\n`));
        } else {
          // Fallback to chunked response
          const response = await generateResponse(message, model);
          
          // Split response into chunks for streaming
          const words = response.split(' ');
          let currentChunk = '';
          
          for (let i = 0; i < words.length; i++) {
            currentChunk += words[i] + ' ';
            
            // Send chunk every few words
            if (i % 3 === 0 || i === words.length - 1) {
              const chunk = {
                content: currentChunk,
                done: i === words.length - 1
              };
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
              currentChunk = '';
              
              // Small delay to simulate streaming
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        }
        
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

async function generateResponse(message: string, model: string): Promise<string> {
  // Try Groq API first if available
  if (model.startsWith('groq-') && process.env.GROQ_API_KEY) {
    try {
      let groqModel = 'llama-3.1-8b-instant'; // Default model
      if (model === 'groq-llama3-8b') {
        groqModel = 'llama-3.1-8b-instant';
      } else if (model === 'groq-llama3-70b') {
        groqModel = 'llama-3.1-70b-versatile';
      }
      console.log('Using Groq API with model:', groqModel);
      return await groqClient.generateResponse(message, groqModel);
    } catch (error) {
      console.error('Groq API error:', error);
      console.log('Falling back to local responses');
      // Fallback to local responses
    }
  } else {
    console.log('Groq API key not available, using local responses');
  }

  const lowerMessage = message.toLowerCase();
  
  // Enhanced dental AI responses with more variety and specificity
  const responses = {
    // Pain-related responses
    "tooth pain": [
      "I understand you're experiencing tooth pain. This can be caused by several factors including cavities, gum disease, tooth sensitivity, or even sinus issues. The pain could be sharp, throbbing, or constant. I recommend scheduling an appointment with a dentist as soon as possible for proper evaluation and treatment.",
      "Tooth pain is often a sign that something needs attention. It could indicate a cavity, infection, cracked tooth, or gum disease. The sooner you see a dentist, the better the outcome. Would you like me to help you find an available appointment?",
      "Persistent tooth pain should be evaluated by a dentist promptly. It could be due to decay, infection, or other dental issues that need professional care. In the meantime, you can try rinsing with warm salt water and avoiding very hot or cold foods."
    ],
    "pain": [
      "Dental pain can vary in intensity and cause. It's important to see a dentist to determine the underlying issue and get appropriate treatment. Pain is your body's way of telling you something needs attention.",
      "Pain in your teeth or gums should not be ignored. A dentist can help identify the cause and provide relief through proper treatment. The sooner you address it, the better."
    ],
    "hurt": [
      "I'm sorry to hear you're experiencing dental pain. Tooth pain can be quite uncomfortable and may indicate various issues. A dentist can properly diagnose the cause and provide effective treatment.",
      "Dental pain is never fun to deal with. It's important to get it checked out by a professional who can identify the root cause and provide appropriate care."
    ],
    
    // Cavity-related responses
    "cavity": [
      "Cavities are caused by bacteria that produce acid, which damages tooth enamel over time. Good oral hygiene including regular brushing with fluoride toothpaste, flossing daily, and limiting sugary foods can help prevent cavities. A dentist can treat existing cavities with fillings, crowns, or other restorative procedures.",
      "Cavities develop when bacteria in plaque produce acids that erode tooth enamel. Regular dental checkups every six months, proper brushing and flossing, and a balanced diet can prevent them. Existing cavities need professional treatment to prevent further damage.",
      "Tooth decay (cavities) occurs when bacteria break down tooth structure. Prevention through proper oral hygiene, regular dental visits, and a healthy diet is key. If you suspect a cavity, it's important to see a dentist before it worsens."
    ],
    "decay": [
      "Tooth decay is a progressive condition that can lead to cavities and tooth loss if untreated. Early detection and treatment by a dentist can prevent further damage and preserve your tooth structure.",
      "Decay occurs when bacteria produce acids that dissolve tooth enamel. Good oral hygiene and regular dental visits can prevent and treat decay. The earlier it's caught, the easier and less expensive the treatment."
    ],
    "hole": [
      "A hole in your tooth is likely a cavity that needs professional treatment. The dentist can clean out the decayed area and fill it with a dental filling to restore the tooth's function and appearance.",
      "Holes in teeth are usually cavities caused by tooth decay. It's important to get them filled promptly to prevent further damage and potential infection."
    ],
    
    // Gum-related responses
    "gum bleeding": [
      "Bleeding gums often indicate gingivitis or gum disease. This is usually caused by plaque buildup along the gumline. I recommend improving your oral hygiene routine with proper brushing and flossing, and seeing a dentist for a professional cleaning.",
      "Bleeding gums are a common sign of gum disease. Proper brushing technique, daily flossing, and regular dental cleanings can help reverse early gum disease. If bleeding persists, see a dentist.",
      "Gum bleeding should not be ignored as it can indicate gum disease. A dentist can assess your gum health, perform a deep cleaning if needed, and provide guidance on proper oral hygiene."
    ],
    "gum": [
      "Healthy gums are essential for overall dental health. If you're experiencing gum issues like bleeding, swelling, or tenderness, a dentist can evaluate your gum health and recommend appropriate care.",
      "Gum problems can range from mild gingivitis to more serious periodontal disease. Regular dental checkups and proper oral hygiene can help maintain healthy gums."
    ],
    "gingivitis": [
      "Gingivitis is the early stage of gum disease, often characterized by red, swollen, or bleeding gums. It's usually reversible with proper oral hygiene and professional dental cleanings.",
      "Gingivitis is inflammation of the gums caused by plaque buildup. Good brushing and flossing habits, along with regular dental visits, can help prevent and treat it."
    ],
    
    // Bad breath responses
    "bad breath": [
      "Bad breath can be caused by poor oral hygiene, certain foods, dry mouth, or underlying dental issues. Regular brushing, flossing, tongue cleaning, and staying hydrated can help. If it persists, consult a dentist as it may indicate gum disease or other issues.",
      "Persistent bad breath may indicate gum disease, cavities, or other dental issues. A dentist can help identify the cause and recommend treatment. Good oral hygiene and regular dental visits are key to prevention.",
      "Bad breath can have various causes including poor oral hygiene, gum disease, dry mouth, or certain foods. A dentist can help determine the underlying cause and provide appropriate treatment."
    ],
    "halitosis": [
      "Halitosis (chronic bad breath) can be caused by various factors including gum disease, cavities, dry mouth, or certain medical conditions. A dentist can help identify the cause and recommend appropriate treatment.",
      "Chronic bad breath (halitosis) often indicates an underlying dental or medical issue. It's important to see a dentist to determine the cause and get proper treatment."
    ],
    
    // Sensitivity responses
    "tooth sensitivity": [
      "Tooth sensitivity to hot or cold can indicate enamel wear or gum recession. Using a soft-bristled toothbrush, sensitivity toothpaste, and avoiding acidic foods can help. A dentist can provide professional treatment options like fluoride treatments or bonding.",
      "Sensitive teeth can be caused by exposed dentin, gum recession, or enamel wear. A dentist can recommend treatments like desensitizing agents, fluoride treatments, or restorative procedures.",
      "Tooth sensitivity is common and can often be managed with proper oral care and professional treatment. A dentist can assess the cause and recommend the best solutions for your specific situation."
    ],
    "sensitive": [
      "Tooth sensitivity can be managed with proper oral care and professional treatment. A dentist can help identify the cause and recommend appropriate solutions.",
      "If you're experiencing tooth sensitivity, it's important to use gentle oral care products and see a dentist for evaluation and treatment options."
    ],
    "cold": [
      "Sensitivity to cold foods or drinks often indicates tooth sensitivity or potential dental issues. A dentist can evaluate the cause and recommend appropriate treatment.",
      "Cold sensitivity can be a sign of tooth decay, gum recession, or enamel wear. It's best to have it checked by a dentist."
    ],
    "hot": [
      "Sensitivity to hot foods or drinks can indicate various dental issues including decay, infection, or nerve problems. A dentist can properly diagnose and treat the underlying cause.",
      "Hot sensitivity should be evaluated by a dentist as it may indicate serious dental issues that need prompt attention."
    ],
    
    // General dental care
    "brush": [
      "Brushing twice daily with fluoride toothpaste is essential for good oral health. Use a soft-bristled brush and brush for at least two minutes each time, covering all surfaces of your teeth and your tongue.",
      "Proper brushing technique is important for removing plaque and preventing cavities. Brush all surfaces of your teeth, use gentle circular motions, and don't forget to brush your tongue to remove bacteria."
    ],
    "floss": [
      "Flossing daily helps remove plaque between teeth where your toothbrush can't reach. This is crucial for preventing cavities and gum disease in these hard-to-reach areas.",
      "Regular flossing is essential for maintaining healthy gums and preventing cavities between teeth. Make it part of your daily oral hygiene routine for optimal dental health."
    ],
    "oral hygiene": [
      "Good oral hygiene includes brushing twice daily, flossing daily, using mouthwash, and regular dental checkups. This helps prevent cavities, gum disease, and other dental problems.",
      "Maintaining good oral hygiene is the foundation of dental health. This includes proper brushing, flossing, a balanced diet, and regular professional cleanings."
    ],
    
    // Emergency responses
    "emergency": [
      "Dental emergencies require immediate attention. If you have severe pain, swelling, facial trauma, or a knocked-out tooth, contact a dentist or emergency dental service right away.",
      "For dental emergencies like severe pain, broken teeth, or facial swelling, seek immediate dental care. Don't delay treatment for urgent dental issues as they can worsen quickly."
    ],
    "broken": [
      "A broken tooth is a dental emergency that needs immediate attention. Rinse your mouth with warm water, apply a cold compress to reduce swelling, and see a dentist as soon as possible.",
      "If you've broken a tooth, try to save any pieces, rinse your mouth gently, and contact a dentist immediately for proper treatment."
    ],
    "knocked out": [
      "A knocked-out tooth is a dental emergency. If possible, gently place the tooth back in its socket or keep it moist in milk or saliva, and see a dentist immediately for the best chance of saving the tooth.",
      "For a knocked-out tooth, time is critical. Handle the tooth by the crown, not the root, and seek immediate dental care for the best outcome."
    ],
    
    // Appointment-related
    "appointment": [
      "I'd be happy to help you book a dental appointment. You can schedule one through our appointment booking system or contact a dentist directly. Regular checkups are important for maintaining good oral health.",
      "Scheduling regular dental appointments is crucial for maintaining good oral health. Most dentists recommend checkups every six months for preventive care.",
      "Booking regular dental appointments helps prevent problems and maintain healthy teeth and gums. I can help you find available appointment times."
    ],
    "book": [
      "You can book a dental appointment through our online system. Regular checkups are important for maintaining good oral health and catching problems early.",
      "I can help you find available appointment times. Regular dental visits are essential for preventing problems and maintaining healthy teeth and gums."
    ],
    "schedule": [
      "Scheduling regular dental visits is important for preventive care. I can help you find available appointment times that work with your schedule.",
      "Regular dental appointments help maintain oral health and prevent problems. Let me help you find a convenient time to see a dentist."
    ],
    
    // Cost and insurance
    "cost": [
      "Dental costs can vary depending on the treatment needed. Many dental offices offer payment plans, and dental insurance can help cover costs. I recommend discussing payment options with your dentist.",
      "The cost of dental treatment depends on the specific procedure needed. Most dentists offer payment plans and can work with your insurance to make treatment affordable."
    ],
    "insurance": [
      "Dental insurance can help cover the cost of preventive care and treatments. Check with your insurance provider about coverage and find a dentist who accepts your plan.",
      "Many dental offices work with various insurance plans. I can help you find dentists who accept your insurance coverage."
    ],
    
    // Preventive care
    "prevent": [
      "Preventing dental problems is easier and less expensive than treating them. Good oral hygiene, regular checkups, a balanced diet, and avoiding tobacco can help maintain healthy teeth and gums.",
      "Prevention is key to maintaining good oral health. This includes proper brushing and flossing, regular dental visits, limiting sugary foods, and not smoking."
    ],
    "checkup": [
      "Regular dental checkups every six months help prevent problems and maintain good oral health. Your dentist can detect issues early when they're easier and less expensive to treat.",
      "Dental checkups are important for preventive care. They allow your dentist to catch problems early and provide professional cleanings to remove plaque and tartar."
    ]
  };

  // Find the best matching response
  for (const [keyword, responseArray] of Object.entries(responses)) {
    if (lowerMessage.includes(keyword)) {
      // Return a random response from the array for variety
      const randomIndex = Math.floor(Math.random() * responseArray.length);
      return responseArray[randomIndex];
    }
  }

  // Enhanced default responses based on message content
  const defaultResponses = [
    "I understand you have a dental concern. While I can provide general information, I recommend consulting with a dentist for personalized advice. Would you like me to help you book an appointment?",
    "That's a good question about dental health. For the most accurate advice, I'd recommend scheduling an appointment with a dentist who can examine your specific situation.",
    "I can provide general dental information, but for personalized advice about your specific concern, it's best to consult with a dentist. Would you like help finding an appointment?",
    "Dental health is important, and I'm here to help with general information. For specific concerns, a dentist can provide the best evaluation and treatment recommendations.",
    "I'm here to help with general dental questions. For personalized advice and treatment, I recommend seeing a dentist who can evaluate your specific situation.",
    "That's an important dental question. While I can provide general guidance, a dentist can give you personalized advice based on your specific needs and oral health.",
    "I appreciate you asking about dental health. For the most accurate and personalized advice, I'd recommend scheduling a consultation with a dentist who can assess your specific situation.",
    "That's a great question about oral health. While I can provide general information, a dentist can give you personalized recommendations based on your individual needs and oral health status.",
    "I'm here to help with dental questions. For specific concerns or personalized advice, I recommend consulting with a dentist who can provide professional evaluation and treatment recommendations.",
    "Thank you for your dental question. For the best care and advice tailored to your specific needs, I'd suggest scheduling an appointment with a dentist for a professional evaluation."
  ];

  // Try to provide a more contextual response based on keywords
  const contextualKeywords = {
    "appointment": "I'd be happy to help you schedule a dental appointment. You can book one through our appointment system or contact a dentist directly.",
    "cost": "Dental costs can vary depending on the treatment needed. Many dental offices offer payment plans, and dental insurance can help cover costs. I recommend discussing payment options with your dentist.",
    "emergency": "If you're experiencing a dental emergency like severe pain, swelling, or trauma, please contact a dentist or emergency dental service immediately.",
    "prevention": "Preventing dental problems is easier and less expensive than treating them. Good oral hygiene, regular checkups, a balanced diet, and avoiding tobacco can help maintain healthy teeth and gums.",
    "children": "Children's dental health is very important. Regular checkups, proper brushing, and limiting sugary foods can help prevent cavities. I recommend finding a pediatric dentist for your child's specific needs."
  };

  // Check for contextual keywords
  for (const [keyword, response] of Object.entries(contextualKeywords)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }

  // Return a random default response
  const randomIndex = Math.floor(Math.random() * defaultResponses.length);
  const response = defaultResponses[randomIndex];
  
  // Add debug info to help identify when using local responses
  console.log('Using local response system for message:', message.substring(0, 50) + '...');
  
  return response;
}
