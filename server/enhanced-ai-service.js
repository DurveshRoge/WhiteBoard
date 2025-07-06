// Modified AI Service with Gemini as primary fallback when OpenAI quota is exceeded

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI services with fallbacks
let openai = null;
let genAI = null;
let initialized = false;

// Initialize AI services (call this after environment variables are loaded)
function initializeAIServices() {
  if (initialized) return;
  
  // Initialize OpenAI if API key is available
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('✅ OpenAI initialized successfully');
    } catch (error) {
      console.warn('⚠️ Failed to initialize OpenAI:', error.message);
    }
  } else {
    console.warn('⚠️ OpenAI API key not configured - AI features will use Gemini');
  }

  // Initialize Google Gemini if API key is available
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Google Gemini initialized successfully');
    } catch (error) {
      console.warn('⚠️ Failed to initialize Google Gemini:', error.message);
    }
  } else {
    console.warn('⚠️ Google Gemini API key not configured - AI features will be limited');
  }
  
  initialized = true;
}

// Enhanced AI Service class with Gemini fallback
class EnhancedAIService {

  // Ensure AI services are initialized
  ensureInitialized() {
    if (!initialized) {
      initializeAIServices();
    }
  }

  // Try OpenAI first, fallback to Gemini if quota exceeded
  async generateWithFallback(openAIFunction, geminiFunction, fallbackData) {
    this.ensureInitialized();
    
    // Try OpenAI first
    if (openai) {
      try {
        return await openAIFunction();
      } catch (error) {
        console.log('OpenAI failed, trying Gemini fallback:', error.message);
        
        // If quota exceeded and Gemini is available, try Gemini
        if ((error.message.includes('429') || error.message.includes('quota')) && genAI) {
          try {
            return await geminiFunction();
          } catch (geminiError) {
            console.error('Gemini also failed:', geminiError.message);
            return fallbackData;
          }
        }
        
        return fallbackData;
      }
    }
    
    // If OpenAI not available, try Gemini
    if (genAI) {
      try {
        return await geminiFunction();
      } catch (geminiError) {
        console.error('Gemini failed:', geminiError.message);
        return fallbackData;
      }
    }
    
    // Both failed, return fallback
    return fallbackData;
  }

  // Generate drawing suggestions with Gemini fallback
  async generateDrawingSuggestions(description, boardContext = '') {
    const openAIFunction = async () => {
      const prompt = `
        Given this whiteboard context: "${boardContext}"
        And this user request: "${description}"
        
        Please suggest 3-5 drawing elements that would be helpful to add to the whiteboard.
        Format the response as JSON with this structure:
        {
          "suggestions": [
            {
              "type": "element_type",
              "position": {"x": 100, "y": 100},
              "properties": {...},
              "explanation": "Why this element is useful"
            }
          ]
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that helps users create better whiteboard diagrams."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return JSON.parse(completion.choices[0].message.content);
    };

    const geminiFunction = async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Context: "${boardContext}"
        Request: "${description}"
        
        Generate 3-5 whiteboard drawing suggestions. Format as JSON:
        {
          "suggestions": [
            {
              "type": "rectangle|circle|arrow|text|diamond",
              "position": {"x": 100, "y": 100},
              "properties": {"width": 120, "height": 60, "text": "content"},
              "explanation": "why this helps"
            }
          ]
        }
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      throw new Error('Could not parse Gemini response');
    };

    const fallbackData = {
      suggestions: [
        {
          type: 'rectangle',
          position: { x: 100, y: 100 },
          properties: { width: 120, height: 60, text: 'Add your content here' },
          explanation: 'A basic rectangle for organizing content'
        },
        {
          type: 'text',
          position: { x: 100, y: 200 },
          properties: { text: 'Add descriptive text', fontSize: 16 },
          explanation: 'Text element for labels and descriptions'
        },
        {
          type: 'arrow',
          position: { x: 100, y: 300 },
          properties: { points: [0, 0, 100, 0] },
          explanation: 'Arrow to show flow or direction'
        }
      ],
      message: 'Using enhanced fallback with Gemini integration'
    };

    return await this.generateWithFallback(openAIFunction, geminiFunction, fallbackData);
  }
}

const enhancedAIService = new EnhancedAIService();

export { initializeAIServices };
export default enhancedAIService;
