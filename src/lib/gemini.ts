import { GoogleGenerativeAI } from '@google/generative-ai';
import { format } from 'date-fns';
import { listUpcomingEvents, createEvent } from './calendar';

const genAI = new GoogleGenerativeAI("AIzaSyBAUeMGmXN5Cfyo4Rp-83pBZCV4suJRBvQ");

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Add calendar context if available
    let calendarContext = '';
    try {
      const events = await listUpcomingEvents();
      if (events && events.length > 0) {
        calendarContext = '\n\nUpcoming events:\n' + events.map(event => {
          const start = event.start.dateTime || event.start.date;
          return `- ${event.summary} on ${format(new Date(start), 'PPpp')}`;
        }).join('\n');
      }
    } catch (error) {
      console.log('No calendar access yet');
    }

    const enhancedPrompt = `You are a helpful calendar assistant with access to the user's Google Calendar. 
    Your task is to help manage appointments and respond to calendar-related queries.
    
    User message: ${prompt}
    ${calendarContext}
    
    Please provide a helpful response. If the user wants to schedule something, extract the date, time, and event details.`;

    const result = await model.generateContent(enhancedPrompt);
    if (!result || !result.response) {
      throw new Error("Invalid API response.");
    }

    const response = await result.response.text();

    // Check if the response contains event scheduling intent
    if (response.toLowerCase().includes('schedule') || response.toLowerCase().includes('criar evento')) {
      // TODO: Parse the response and create the event
      // This would require natural language processing to extract date/time/details
      // For now, we'll just return the response
    }

    return response || "No response generated.";
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}