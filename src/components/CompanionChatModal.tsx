import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Shield,
  Bot,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { AstraMascot } from './AstraMascot.tsx';

interface Message {
  id: string;
  sender: 'user' | 'astra';
  text: string;
  time: string;
}

interface CompanionChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanionChatModal: React.FC<CompanionChatModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, tasks, academics, focusSessions, reducedMotion } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'astra',
      text: "Konnichiwa, my star! ✨ I'm your productivity companion. How can I help you organize, prioritize, or cheer you on today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(profile?.aiEnabled ?? true);
  const [strictPrivacy, setStrictPrivacy] = useState(profile?.aiPrivacyStrict ?? false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleEnableAi = async () => {
    setPrivacyAgreed(true);
    await updateProfile({ aiEnabled: true, aiPrivacyStrict: strictPrivacy });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build sanitized context (no private passwords, only aggregated counts)
      const context = {
        pendingTasksCount: tasks.filter(t => !t.isCompleted).length,
        completedToday: tasks.filter(t => t.isCompleted).length,
        currentSGPA: profile?.currentSGPA,
        targetSGPA: profile?.targetSGPA,
        upcomingDeadline: tasks.find(t => !t.isCompleted && t.deadlineDate)?.deadlineDate,
      };

      const res = await fetch('/api/ai/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          context: strictPrivacy ? undefined : context,
          companionName: profile?.mascotName || 'Astra',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Companion service temporarily resting.');
      }

      const data = await res.json();
      const astraMsg: Message = {
        id: `astra-${Date.now()}`,
        sender: 'astra',
        text: data.reply || 'I am right here cheering for you, my star! ✨',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, astraMsg]);
    } catch (err: any) {
      console.error(err);
      const fallbackReply =
        "Even when servers take a brief rest, your determination is what counts! Take a sip of water, focus on your next top task for 25 minutes, and you'll do wonderfully! 🌸";
      setMessages(prev => [
        ...prev,
        {
          id: `astra-${Date.now()}`,
          sender: 'astra',
          text: `${fallbackReply}\n\n(Note: ${err.message})`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'How should I prioritize my day?',
    'Give me a 3-minute study morale boost!',
    'Suggest a balanced focus & break rhythm.',
    'Explain why DSA is essential for my tech career.',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full h-[600px] max-h-[90vh] shadow-2xl border border-pink-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm font-['Quicksand'] flex items-center gap-1.5">
                {profile?.mascotName || 'Astra-chan'} • AI Companion
              </h3>
              <p className="text-[10px] text-pink-100">
                Personal Academic & Time-Intelligence Advisor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Privacy Notice Gate (if not yet accepted) */}
        {!privacyAgreed ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              Companion Privacy & Intelligence Notice
            </h3>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              ASTRA-PLAN values your privacy above all.
              Your personal AI assistant only accesses minimum schedule context (such as task counts and deadline dates) through secure server-side proxy routes. Personal notes and authentication credentials are NEVER sent to external APIs.
            </p>

            <div className="bg-pink-50/70 p-3 rounded-2xl border border-pink-100 text-left max-w-md w-full">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={strictPrivacy}
                  onChange={e => setStrictPrivacy(e.target.checked)}
                  className="rounded text-pink-500 w-4 h-4"
                />
                Strict Privacy Mode (Send zero task context; pure conversational advice only)
              </label>
            </div>

            <button
              onClick={handleEnableAi}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold rounded-2xl text-xs shadow-md shadow-pink-200"
            >
              Enable Companion AI ✨
            </button>
          </div>
        ) : (
          <>
            {/* Messages Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-rose-50/20">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {msg.sender === 'astra' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-400 to-indigo-300 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
                      ✨
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-xs'
                        : 'bg-white border border-pink-100 text-slate-800 shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-pink-100' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-pink-600 font-semibold p-2">
                  <Sparkles className="w-4 h-4 animate-spin text-pink-500" />
                  <span>Astra is thinking with starry wisdom...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Inspiration Prompts */}
            <div className="px-4 py-2 bg-white border-t border-pink-50 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Ask:
              </span>
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sp)}
                  disabled={isLoading}
                  className="px-2.5 py-1 bg-pink-50/60 hover:bg-pink-100/70 border border-pink-100 rounded-xl text-pink-700 whitespace-nowrap font-medium transition"
                >
                  {sp}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-pink-100 flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask Astra for motivation, schedule tips, or study breakdown..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-indigo-500 hover:opacity-90 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
