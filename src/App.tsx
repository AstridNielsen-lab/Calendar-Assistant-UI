import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Brain, MemoryStick as Memory, Bot, ExternalLink } from 'lucide-react';
import { generateResponse } from './lib/gemini';
import { initializeGoogleCalendar, handleAuthClick, handleSignoutClick } from './lib/calendar';

function App() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hi! I'm your AI Calendar Assistant powered by Google Gemini. Please sign in with Google to access your calendar.", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    document.title = 'AI Calendar Assistant - Like Look Solutions';
    initializeGoogleCalendar();

    const handleGapiLoaded = () => {
      setIsSignedIn(gapi.auth2?.getAuthInstance()?.isSignedIn.get() || false);
    };

    document.addEventListener('gapi-loaded', handleGapiLoaded);
    return () => document.removeEventListener('gapi-loaded', handleGapiLoaded);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

    try {
      const prompt = `You are a helpful calendar assistant. The user's message is: ${userMessage}. 
                     Provide a helpful response about their calendar inquiry.`;
      
      const response = await generateResponse(prompt);
      
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, 
        { text: "I apologize, but I encountered an error. Please try again.", isUser: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Calendar Assistant</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={isSignedIn ? handleSignoutClick : handleAuthClick}
              className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isSignedIn ? 'Sign Out' : 'Sign in with Google'}
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Powered by</span>
              <img 
                src="https://raw.githubusercontent.com/AstridNielsen-lab/Calendar-Assistant-UI/refs/heads/index/src/1728457808_Google_Gemini_logo_PNG.png" 
                alt="Gemini"
                className="h-6"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isSignedIn ? "Ask about your calendar..." : "Please sign in to use the calendar assistant"}
                    disabled={isLoading || !isSignedIn}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !isSignedIn}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Workflow Visualization */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Workflow Components</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="font-medium">Chat Trigger</h3>
                  <p className="text-sm text-gray-500">Handles incoming messages</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Bot className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-medium">AI Agent</h3>
                  <p className="text-sm text-gray-500">Processes your requests</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-medium">Gemini Model</h3>
                  <p className="text-sm text-gray-500">Powers the AI responses</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Memory className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-medium">Memory Buffer</h3>
                  <p className="text-sm text-gray-500">Maintains conversation context</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-medium">Google Calendar</h3>
                  <p className="text-sm text-gray-500">Manages calendar events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Developer Info */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm">
              Desenvolvido por <span className="font-semibold">Julio Campos Machado</span>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="https://wa.me/5511992946628" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-500 hover:text-blue-600 flex items-center space-x-1">
                <span>WhatsApp</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Like Look Solutions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
