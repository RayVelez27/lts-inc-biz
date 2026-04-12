"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2, Bot, User } from "lucide-react";

interface ChatMessage {
  id: string;
  type: "user" | "bot" | "agent";
  content: string;
  timestamp: Date;
}

const quickReplies = [
  "Track my order",
  "Shipping information",
  "Return policy",
  "Talk to a human",
];

const botResponses: Record<string, string> = {
  greeting: "Hi there! 👋 I'm LT's virtual assistant. How can I help you today?",
  track: "To track your order, please go to our Order Tracking page or enter your order number (starts with LTS-). You can also find the tracking link in your confirmation email.",
  shipping: "We offer free shipping on orders over $150! Standard shipping takes 2-3 weeks for custom embroidered items. Rush options are available for an additional fee. Need more details?",
  return: "We want you to love your order! If you're not satisfied, contact us within 30 days of delivery. Custom embroidered items cannot be returned unless there's a defect. Would you like to start a return?",
  human: "I'll connect you with a team member. Our hours are Monday-Friday, 8am-5pm ET. Please leave your message and we'll respond as soon as possible!",
  pricing: "Our pricing includes logo setup at no extra cost! Volume discounts start at 24 items (5% off) up to 20% off for 144+ items. Would you like a custom quote?",
  logo: "We accept most image formats including PNG, JPG, AI, and EPS. For best results, please provide a high-resolution file. We'll create a digital proof for your approval before production.",
  default: "Thanks for your message! I'm still learning, but I can help with order tracking, shipping info, returns, and logo questions. Or type 'human' to connect with our team.",
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setTimeout(() => {
        addBotMessage(botResponses.greeting);
        setHasGreeted(true);
      }, 500);
    }
  }, [isOpen, hasGreeted]);

  const addBotMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          type: "bot",
          content,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    const lower = input.toLowerCase();

    if (lower.includes("track") || lower.includes("order") || lower.includes("where")) {
      return botResponses.track;
    }
    if (lower.includes("ship") || lower.includes("delivery") || lower.includes("arrive")) {
      return botResponses.shipping;
    }
    if (lower.includes("return") || lower.includes("refund") || lower.includes("exchange")) {
      return botResponses.return;
    }
    if (lower.includes("human") || lower.includes("agent") || lower.includes("person") || lower.includes("talk")) {
      return botResponses.human;
    }
    if (lower.includes("price") || lower.includes("cost") || lower.includes("discount") || lower.includes("quote")) {
      return botResponses.pricing;
    }
    if (lower.includes("logo") || lower.includes("image") || lower.includes("file") || lower.includes("upload")) {
      return botResponses.logo;
    }

    return botResponses.default;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        type: "user",
        content: inputValue,
        timestamp: new Date(),
      },
    ]);

    const response = getBotResponse(inputValue);
    setInputValue("");
    addBotMessage(response);
  };

  const handleQuickReply = (reply: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        type: "user",
        content: reply,
        timestamp: new Date(),
      },
    ]);

    let response = botResponses.default;
    if (reply.includes("Track")) response = botResponses.track;
    if (reply.includes("Shipping")) response = botResponses.shipping;
    if (reply.includes("Return")) response = botResponses.return;
    if (reply.includes("human")) response = botResponses.human;

    addBotMessage(response);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-navy text-white rounded-full shadow-lg hover:bg-navy-dark transition-all hover:scale-110"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-gold rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl transition-all ${
        isMinimized ? "w-72 h-14" : "w-96 h-[500px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-navy text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-navy" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-navy" />
          </div>
          <div>
            <h3 className="font-semibold">LT's Support</h3>
            <p className="text-xs text-gray-300">We typically reply instantly</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[340px] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === "user"
                      ? "bg-navy text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.type === "user" ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs px-3 py-1.5 bg-cream text-navy rounded-full hover:bg-gold transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-2 bg-navy text-white rounded-full hover:bg-navy-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
