import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { processQuery } from '../utils/aiAssistant';
import { startListening, speakText, stopSpeaking, isVoiceSupported, stopListening } from '../utils/voice';
import { Bot, Send, Sparkles, HelpCircle, Mic, MicOff } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Financial Assistant. I can help you understand your spending patterns, check budgets, analyze goals, and provide financial advice. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wasLastMessageVoiceRef = useRef(false);

  const quickQuestions = [
    'How much did I spend this month?',
    'What\'s my budget status?',
    'Show my savings goals',
    'Am I overspending?',
    'What\'s my financial health score?',
    'Give me savings advice',
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVoiceInput = async () => {
    if (isListening) {
        await stopListening();
        setIsListening(false);
        return;
    }
    
    stopSpeaking(); // Stop any ongoing AI speech
    setIsListening(true);
    wasLastMessageVoiceRef.current = true;

    startListening(
        (text) => {
            setInput(text);
        },
        (error) => {
            console.error(error);
            setIsListening(false);
        },
        () => {
            setIsListening(false);
            // On end, if we got text, auto-send it
            // We use a small timeout to ensure the state has updated
            setTimeout(() => {
                const submitBtn = document.getElementById('chat-submit-btn');
                if (submitBtn && !submitBtn.hasAttribute('disabled')) {
                    submitBtn.click();
                }
            }, 100);
        }
    );
  };

  const handleSendMessage = async (message?: string) => {
    const userMessage = message || input.trim();
    if (!userMessage) return;

    // Track if this manual message was NOT from voice
    if (message) wasLastMessageVoiceRef.current = false;

    // Add user message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    stopSpeaking(); // Stop speaking if they send a new message

    try {
      // Map existing messages to OpenAI format for memory
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await processQuery(userMessage, history);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      
      setMessages((prev) => [...prev, assistantMsg]);

      // If the user used their voice to ask, reply with voice
      if (wasLastMessageVoiceRef.current) {
          speakText(response);
      }
      
      wasLastMessageVoiceRef.current = false;

    } catch (error) {
      const errorText = "I'm sorry, I'm having trouble connecting to my brain right now. Please check your internet connection or API key.";
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">AI Financial Assistant</h1>
        <p className="text-gray-600 mt-1">Ask me anything about your finances</p>
      </div>

      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <HelpCircle className="w-4 h-4" />
            Quick Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                onClick={() => handleSendMessage(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            {isVoiceSupported() && (
                <Button 
                    variant={isListening ? "destructive" : "secondary"} 
                    onClick={handleVoiceInput}
                    className={`transition-all ${isListening ? 'animate-pulse' : ''}`}
                    title="Use Voice Input"
                >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
            )}
            <Input
              id="chat-input-field"
              placeholder={isListening ? "Listening..." : "Ask me about your spending, budgets, or goals..."}
              value={input}
              onChange={(e) => {
                  setInput(e.target.value);
                  wasLastMessageVoiceRef.current = false; // Cancel voice mode tracking if they type manually
              }}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isListening}
            />
            <Button id="chat-submit-btn" onClick={() => handleSendMessage()} disabled={!input.trim() || isListening}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Type "help" to see all available commands
          </p>
        </div>
      </Card>

      {/* Features Info */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">What I Can Do</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
            <span>Answer spending queries by category or time period</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
            <span>Check your budget status and alerts</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
            <span>Analyze your savings goals progress</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
            <span>Provide your financial health score breakdown</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
            <span>Detect overspending and wasteful expenses</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
            <span>Give personalized savings tips and advice</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
