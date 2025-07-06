import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiParsing() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Context: "User Authentication Whiteboard"
      User Request: "Add a flowchart for user login process"
      
      Generate 3-5 whiteboard drawing suggestions that would be helpful. 
      
      Format as JSON:
      {
        "suggestions": [
          {
            "type": "rectangle|circle|arrow|text|diamond|line",
            "position": {"x": 100, "y": 100},
            "properties": {"width": 120, "height": 60, "text": "content", "fontSize": 16},
            "explanation": "Why this element is useful"
          }
        ]
      }
      
      Make suggestions practical and relevant to the request.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini Response:');
    console.log('===================');
    console.log(text);
    console.log('===================');
    
    // Try to extract JSON
    let jsonStr = '';
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
      console.log('\nExtracted JSON:');
      console.log(jsonStr);
      
      try {
        const parsed = JSON.parse(jsonStr);
        console.log('\nParsed successfully:');
        console.log(JSON.stringify(parsed, null, 2));
      } catch (parseError) {
        console.log('\nJSON Parse Error:', parseError.message);
      }
    } else {
      console.log('\nNo JSON code block found, trying direct JSON match...');
      const directMatch = text.match(/\{[\s\S]*\}/);
      if (directMatch) {
        jsonStr = directMatch[0].trim();
        console.log('Found JSON object:', jsonStr);
        
        try {
          const parsed = JSON.parse(jsonStr);
          console.log('Parsed successfully:');
          console.log(JSON.stringify(parsed, null, 2));
        } catch (parseError) {
          console.log('JSON Parse Error:', parseError.message);
        }
      } else {
        console.log('No JSON found in response');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGeminiParsing();
