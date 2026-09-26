import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Zap,
  Brain,
  Sliders,
  Bot,
  User,
  HelpCircle,
  Shield,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { ChatMessage, ChatRole, StoryEngineModel, Character, QuestState, InventoryItem } from '../types/adventure';

interface GeminiCompanionChatProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  questState: QuestState;
  inventory: InventoryItem[];
  currentLocation: string;
  narrativeContext: string;
}

export const GeminiCompanionChat: React.FC<GeminiCompanionChatProps> = ({
  isOpen,
  onClose,
  character,
  questState,
  inventory,
  currentLocation,
  narrativeContext,
}) => {
  const [role, setRole] = useState<ChatRole>('oracle');
  const [chatModel, setChatModel] = useState<StoryEngineModel>('gemini-3.5-flash');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Greetings, ${character.name}. I am the Oracle of Aetheria. As you traverse ${currentLocation || 'these strange lands'}, speak to me of your doubts, ask of hidden omens, or consult me on the fate of your quest.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
      roleType: 'oracle',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            text: m.text,
          })),
          role,
          model: chatModel,
          character,
          questState,
          inventory,
          currentLocation,
          narrativeContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach Gemini companion');
      }

      const data = await response.json();
      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.text || 'The whispers fade into the void without answer.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || chatModel,
        roleType: role,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `*A sudden spiritual dissonance ripples through the connection: ${err.message || 'Unable to consult the spirits'}.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleType: role,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'reset',
        role: 'model',
        text: `The circle is cleansed. What shall we ponder next, ${character.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleType: role,
      },
    ]);
  };

  // Role suggestions
  const getSuggestions = () => {
    switch (role) {
      case 'oracle':
        return [
          'What ancient omens surround our current quest?',
          'What secret weakness does this region conceal?',
          'Explain the historical lore of this land',
        ];
      case 'companion':
        return [
          'How are you holding up, friend?',
          'What do your instincts say we should do next?',
          'Do you think our current path is too dangerous?',
        ];
      case 'tactician':
        return [
          'Evaluate our current combat & survival readiness',
          'How can we best use our carried items right now?',
          'What tactical ambushes should we anticipate?',
        ];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] z-50 bg-[#0a0d14] border-l border-purple-900/50 shadow-2xl flex flex-col backdrop-blur-xl animate-fadeIn">
      {/* Header */}
      <div className="p-3.5 border-b border-purple-900/40 bg-purple-950/20 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-cinzel text-sm font-bold text-purple-200">
                Gemini DM Companion
              </h3>
              <p className="text-[10px] text-purple-300/70">
                Multi-Turn In-World Assistant & Lorekeeper
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              title="Clear Chat History"
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Role Selector with system instructions */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setRole('oracle')}
            className={`py-1 rounded font-medium transition-all ${
              role === 'oracle'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            🔮 The Oracle
          </button>
          <button
            onClick={() => setRole('companion')}
            className={`py-1 rounded font-medium transition-all ${
              role === 'companion'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            🐾 Companion
          </button>
          <button
            onClick={() => setRole('tactician')}
            className={`py-1 rounded font-medium transition-all ${
              role === 'tactician'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            ⚔️ Tactician
          </button>
        </div>

        {/* Model Selector (Flash Lite vs 3.5 Flash vs 3.1 Pro) as strictly requested */}
        <div className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2 py-1.5 rounded border border-purple-900/30">
          <span className="text-slate-400 flex items-center gap-1 font-semibold">
            <Sliders className="w-3 h-3 text-purple-400" />
            Model Task:
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setChatModel('gemini-3.1-flash-lite')}
              title="Fastest low-latency responses for quick questions"
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                chatModel === 'gemini-3.1-flash-lite'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Fast Lite
            </button>
            <button
              onClick={() => setChatModel('gemini-3.5-flash')}
              title="General balanced reasoning for conversation"
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                chatModel === 'gemini-3.5-flash'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3.5 Flash
            </button>
            <button
              onClick={() => setChatModel('gemini-3.1-pro-preview')}
              title="Deepest reasoning for complex riddles and lore"
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                chatModel === 'gemini-3.1-pro-preview'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3.1 Pro
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-purple-900/60 border border-purple-500/50 flex items-center justify-center shrink-0 mt-0.5 text-purple-300">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed space-y-1 ${
                  isUser
                    ? 'bg-amber-600/90 text-slate-950 font-medium rounded-tr-xs shadow-sm'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[9px] flex items-center justify-end gap-1.5 pt-1 ${
                    isUser ? 'text-amber-950/70' : 'text-slate-500'
                  }`}
                >
                  {msg.modelUsed && <span>{msg.modelUsed}</span>}
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-full bg-amber-600 border border-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-slate-950 font-bold text-[10px]">
                  {character.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-purple-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Consulting the threads with {chatModel}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-slate-950/70 border-t border-purple-950/40">
        <span className="text-[10px] text-slate-500 block mb-1">Quick Inquiries:</span>
        <div className="flex flex-wrap gap-1">
          {getSuggestions().map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              disabled={isLoading}
              className="text-[10px] px-2 py-0.5 rounded bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 transition-colors text-left"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-purple-900/40 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask ${role === 'oracle' ? 'the Oracle' : role === 'companion' ? 'your companion' : 'the Tactician'}...`}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
