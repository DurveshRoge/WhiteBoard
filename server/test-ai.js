import dotenv from 'dotenv';
dotenv.config();

import { initializeAIServices } from './src/services/aiService.js';
import aiService from './src/services/aiService.js';

console.log('🧪 Testing AI Service directly...');

// Initialize AI services
initializeAIServices();

// Test the AI service directly
async function testAIService() {
  try {
    // First, let's test if the API key is valid by making a simple request
    console.log('\n🔑 Testing OpenAI API key validity...');
    console.log('API Key (first 10 chars):', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
    
    // Test with a minimal request to check authentication
    const { default: OpenAI } = await import('openai');
    const testOpenAI = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    try {
      // Test with the smallest possible request
      const testResponse = await testOpenAI.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 5
      });
      console.log('✅ OpenAI API key is valid and working!');
      console.log('Response:', testResponse.choices[0].message.content);
    } catch (apiError) {
      console.log('❌ OpenAI API Error Details:');
      console.log('Error Code:', apiError.status);
      console.log('Error Type:', apiError.type);
      console.log('Error Message:', apiError.message);
      
      if (apiError.status === 401) {
        console.log('🔍 Diagnosis: Invalid API key or authentication failed');
      } else if (apiError.status === 429) {
        console.log('🔍 Diagnosis: Rate limit or quota exceeded');
        console.log('💡 Suggestion: Check your OpenAI account billing and usage');
      } else if (apiError.status === 403) {
        console.log('🔍 Diagnosis: Access forbidden - check API key permissions');
      }
    }

    console.log('\n📝 Testing drawing suggestions...');
    const suggestions = await aiService.generateDrawingSuggestions(
      'Add a flowchart for user login process', 
      'User Authentication Whiteboard'
    );
    console.log('✅ Suggestions result:', JSON.stringify(suggestions, null, 2));

    console.log('\n🎨 Testing color scheme...');
    const colors = await aiService.generateColorSuggestions('business');
    console.log('✅ Color scheme result:', JSON.stringify(colors, null, 2));

    console.log('\n📊 Testing flowchart generation...');
    const flowchart = await aiService.generateFlowchart('User registration process with email verification');
    console.log('✅ Flowchart result:', JSON.stringify(flowchart, null, 2));

    console.log('\n🧪 Testing Gemini as alternative...');
    
    // Test Gemini directly
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const testGemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      // Try different model names
      const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
      let workingModel = null;
      
      for (const modelName of modelNames) {
        try {
          console.log(`Testing model: ${modelName}`);
          const model = testGemini.getGenerativeModel({ model: modelName });
          const geminiTest = await model.generateContent("Say hello");
          const geminiResponse = await geminiTest.response;
          console.log(`✅ ${modelName} is working! Response:`, geminiResponse.text());
          workingModel = model;
          break;
        } catch (modelError) {
          console.log(`❌ ${modelName} failed:`, modelError.message);
        }
      }
      
      if (workingModel) {
        // Test if we can use Gemini for suggestions
        const geminiSuggestion = await workingModel.generateContent(`
          Generate 3 whiteboard drawing suggestions for: "Add a flowchart for user login process"
          Format as JSON array with type, position, properties, and explanation for each suggestion.
        `);
        const suggestionResponse = await geminiSuggestion.response;
        console.log('✅ Gemini suggestions test:', suggestionResponse.text());
      }
      
    } catch (geminiError) {
      console.log('❌ Gemini Error:', geminiError.message);
    }

  } catch (error) {
    console.error('❌ AI Service test failed:', error.message);
    console.error('Full error:', error);
  }
}

testAIService();
