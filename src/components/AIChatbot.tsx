import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";
import { RateLimitBadge } from "@/components/RateLimitIndicator";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const CHAT_URL = `https://lnocdbqlxepxuohktjxb.supabase.co/functions/v1/ai-fitness-chat`;

export const AIChatbot = () => {
  const { user } = useSecureAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Athena, your personal fitness assistant. I have access to your complete fitness profile and can provide personalized advice. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; max: number } | null>(null);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Create placeholder for streaming response
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      text: "",
      isUser: false,
      timestamp: new Date(),
    }]);

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: currentInput,
          userId: user.id,
          stream: true,
        }),
      });

      if (!response.ok) {
        // Check for rate limit error
        if (response.status === 429) {
          const errorData = await response.json();
          const waitTime = errorData.retryAfter ? Math.ceil(errorData.retryAfter / 60) : 60;
          setRateLimitInfo({ remaining: 0, max: 30 });
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, text: `⚠️ Rate limit reached. Please wait ${waitTime} minute${waitTime === 1 ? '' : 's'} before sending more messages.` }
                : msg
            )
          );
          return;
        }
        throw new Error('Failed to get response');
      }

      // Update rate limit info from response headers
      const remaining = response.headers.get('X-RateLimit-Remaining');
      if (remaining !== null) {
        setRateLimitInfo({ remaining: parseInt(remaining, 10), max: 30 });
      }

      const contentType = response.headers.get('content-type');
      
      // Check if it's a streaming response
      if (contentType?.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          // Process line-by-line
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantText += content;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, text: assistantText }
                      : msg
                  )
                );
              }
            } catch {
              // Incomplete JSON, put it back
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // If we got no text, show a fallback
        if (!assistantText) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, text: "I'm here to help! What would you like to know about your fitness journey?" }
                : msg
            )
          );
        }
      } else {
        // Non-streaming JSON response
        const data = await response.json();
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, text: data.response || "I'm having trouble responding. Please try again." }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error calling Athena assistant:', error);
      toast({
        title: "Connection Error",
        description: "I'm having trouble connecting. Please try again.",
        variant: "destructive"
      });

      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) return null;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 rounded-full w-12 h-12 bg-primary hover:bg-primary/90 shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-24 right-4 z-50 w-80 h-[500px] flex flex-col shadow-xl border-border/50 bg-card/95 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Athena</CardTitle>
          {rateLimitInfo && (
            <RateLimitBadge remaining={rateLimitInfo.remaining} maxRequests={rateLimitInfo.max} />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
        <ScrollArea className="flex-1 pr-2 min-h-0" ref={scrollRef}>
          <div className="space-y-3 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm break-words ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text || "..."}</p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.text === "" && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2 mt-3 shrink-0">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
