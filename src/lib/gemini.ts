import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API client with your API key
const genAI = new GoogleGenerativeAI("AIzaSyBAUeMGmXN5Cfyo4Rp-83pBZCV4suJRBvQ");

export async function generateResponse(prompt: string): Promise<string> {
  try {
    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content based on the prompt
    const result = await model.generateContent(prompt);
    
    // Check if the response is valid
    if (!result || !result.response) {
      throw new Error("Invalid API response.");
    }

    const response = await result.response.text();
    return response || "No response generated.";
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}