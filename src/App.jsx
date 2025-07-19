import React, { useState, useEffect, useRef } from 'react';
import { generateSmartReply, analyzeLanguageAndSubject } from './components/gemini';

export default function App() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [tone, setTone] = useState('formal');
  const [meta, setMeta] = useState({ language: '', subject: '' });
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const typeWriterEffect = (text) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    let i = 0, typed = '';
    intervalRef.current = setInterval(() => {
      if (i < text.length) {
        typed += text.charAt(i);
        setReply(typed);
        i++;
      } else {
        clearInterval(intervalRef.current);
      }
    }, 10);
  };

  const handleGenerate = async () => {
    if (!message.trim()) return setReply('⚠ Please enter a message.');
    setLoading(true);
    setReply('Generating...');
    setMeta({ language: '', subject: '' });

    try {
      const { language, subject } = await analyzeLanguageAndSubject(message);
      setMeta({ language, subject });
      const smartReply = await generateSmartReply(message, tone, language); // 🛠 language passed here
      typeWriterEffect(smartReply);
    } catch (err) {
      console.error('❌ handleGenerate error:', err);
      setReply('❌ An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => navigator.clipboard.writeText(reply);
  const handleClear = () => { setReply(''); setMessage(''); };

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-100 dark:from-gray-900 dark:to-gray-950 overflow-hidden px-4 py-8 flex items-center justify-center">
      {/* ✨ Animated Blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-sky-300 dark:bg-sky-800 rounded-full blur-3xl opacity-40 animate-pulse-slow"></div>
      <div className="absolute bottom-[-120px] right-[-80px] w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute top-[40%] left-[40%] w-96 h-96 bg-indigo-300 dark:bg-indigo-700 rounded-full blur-3xl opacity-20 animate-pulse-slow"></div>

      {/* 💠 Main Card */}
      <div className="relative z-10 max-w-3xl w-full p-8 rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-sky-200 dark:border-gray-800 shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-sky-500 to-blue-600 text-transparent bg-clip-text mb-2">
          ⚡ QuickReply AI
        </h1>
        <p className="text-center text-sky-600 dark:text-sky-300 mb-6 text-sm">
          Paste a message, select tone, and get a smart AI-generated reply.
        </p>

        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full text-sm p-4 rounded-xl border border-sky-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none shadow-sm mb-4"
          placeholder="📝 Paste your message here..."
        />

        <div className="flex flex-col sm:flex-row justify-between gap-3 items-center mb-4">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="px-4 py-2 text-sm rounded-xl border border-sky-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-sky-400"
          >
            <option value="formal">📄 Formal</option>
            <option value="casual">💬 Casual</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-sky-400 hover:bg-sky-500 text-white font-semibold px-6 py-2 rounded-xl transition-all disabled:opacity-60 shadow-md"
          >
            {loading ? 'Generating...' : '🚀 Generate Reply'}
          </button>
        </div>

        {/* 🌐 Language + Subject */}
        {meta.language && (
          <div className="text-sm text-sky-700 dark:text-sky-300 mb-3">
            🌐 <strong>{meta.language}</strong> {meta.subject && <>| 💡 <strong>{meta.subject}</strong></>}
          </div>
        )}

        {/* 💬 Reply Output */}
        <div className="rounded-xl min-h-[100px] bg-white/90 dark:bg-gray-800 p-4 text-sm whitespace-pre-wrap text-gray-800 dark:text-white border border-sky-200 dark:border-gray-700 shadow-inner mb-4">
          {reply || (
            <span className="text-sky-400 dark:text-sky-500 italic">💡 Your AI-generated reply will appear here...</span>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleCopy}
            disabled={!reply}
            className="bg-sky-300 hover:bg-sky-400 text-white px-4 py-2 rounded-md transition disabled:opacity-40"
          >
            📋 Copy
          </button>
          <button
            onClick={handleClear}
            className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-md transition"
          >
            ❌ Clear
          </button>
        </div>
      </div>

      {/* 🔧 Animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3 }
          50% { transform: scale(1.1); opacity: 0.5 }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
