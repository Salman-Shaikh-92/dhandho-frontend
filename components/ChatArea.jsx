'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, FileText, Check, Copy, Pencil, Lock, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Component for rendering a code block with syntax highlighting and a copy button
function CodeBlock({ node, inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group my-4 rounded-lg overflow-hidden bg-[#1E1E1E]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] text-xs text-gray-300">
          <span className="uppercase font-semibold tracking-wider">{match[1]}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none"
            aria-label="Copy code"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
          {...props}
        >
          {codeText}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className={`${className} bg-surface-hover px-1.5 py-0.5 rounded text-accent`} {...props}>
      {children}
    </code>
  );
}

// Security / Subscription Component: Blurs list descriptions but keeps the name visible
function BlurredListItem({ node, children, onScheduleClick, ...props }) {
  // Recursively process nodes to blur text but keep <strong> visible
  const processNodes = (nodes) => {
    return React.Children.map(nodes, child => {
      if (!React.isValidElement(child)) {
        // Text node: Blur it
        return <span className="blur-[4px] select-none text-gray-400 opacity-60">{child}</span>;
      }
      if (child.props.node?.tagName === 'strong' || child.type === 'strong') {
        // Bold name: Keep it completely visible
        return <strong className="text-white font-bold">{child.props.children}</strong>;
      }
      if (child.props.node?.tagName === 'p' || child.type === 'p') {
        // Paragraph: recurse inside it
        return <span className="inline">{processNodes(child.props.children)}</span>;
      }
      // Any other elements: Blur them
      return <span className="blur-[4px] select-none text-gray-400 opacity-60">{child}</span>;
    });
  };

  return (
    <li className="relative my-4 ml-6 list-disc marker:text-amber-500 group" {...props}>
      <div className="relative z-0 leading-relaxed">
        {/* Render the processed nodes where name is visible and description is blurred */}
        {processNodes(children)}
        
        {/* Hover overlay for the upgrade / schedule call button */}
        <div className="absolute inset-[-10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm rounded-lg z-30 cursor-pointer">
          <button 
            onClick={onScheduleClick}
            className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-transform hover:scale-105"
          >
            <Lock className="h-3 w-3" />
            Schedule Call with Admin to Unlock
          </button>
        </div>
      </div>
    </li>
  );
}

export default function ChatArea({ messages, isLoading, onSendMessage, onEditMessage, onScheduleClick }) {
  const router = useRouter();
  const bottomRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (bottomRef.current) {
      const container = bottomRef.current.parentElement?.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom || messages.length <= 2) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 relative z-0">
      {/* Advanced Animated Background for Empty State */}
      {messages.length <= 1 && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Animated Glowing Orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-amber-500/20 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.05, 0.15, 0.05],
              x: [0, 100, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-orange-600/20 rounded-full blur-[100px]"
          />
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5" />
        </div>
      )}

      <div className={`mx-auto flex max-w-4xl flex-col gap-3 pb-32 relative z-10 ${messages.length <= 1 ? 'min-h-[85vh] justify-center' : 'pt-8 sm:pt-16'}`}>
        {messages.length <= 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center pb-12 text-center"
          >
            {/* AI Listening Indicator / Logo */}
            <div className="relative mb-8 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-amber-500/30 blur-xl"
              />
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_50px_rgba(245,158,11,0.3)] border border-amber-300/40 overflow-hidden"
              >
                <img src="/logo.jfif" alt="Dhandho AI" className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-90 scale-110" />
                <span className="relative z-10 text-white font-black text-3xl tracking-widest drop-shadow-lg">DA</span>
                
                {/* Sweeping light effect */}
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Intelligent Automation</span>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4 text-4xl font-black tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60 drop-shadow-sm"
            >
              What can I automate for you?
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mb-12 max-w-2xl text-base leading-relaxed text-gray-400 font-medium"
            >
              I analyze workflows, identify operational bottlenecks, and architect custom AI integrations to save your agency hundreds of hours.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid w-full max-w-3xl gap-4 sm:grid-cols-2"
            >
              <button 
                onClick={() => onSendMessage && onSendMessage("Audit my sales lead generation workflow.")}
                className="group relative flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.04] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-500" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/0 to-transparent group-hover:via-amber-500/50 transition-all duration-500" />
                
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Audit Sales Workflow</span>
                </div>
                <span className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">Find critical leaks in your current lead generation pipeline and automate follow-ups.</span>
              </button>

              <button 
                onClick={() => onSendMessage && onSendMessage("How can I automate data entry between HubSpot and Google Sheets?")}
                className="group relative flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.04] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-500" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/0 to-transparent group-hover:via-amber-500/50 transition-all duration-500" />
                
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400 group-hover:scale-110 group-hover:bg-green-500/20 transition-all">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Automate Data Entry</span>
                </div>
                <span className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">Connect HubSpot to Google Sheets and eliminate manual data transfer instantly.</span>
              </button>

              <button 
                onClick={() => onSendMessage && onSendMessage("Calculate the ROI of automating my customer onboarding process.")}
                className="group relative flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.04] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-500" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/0 to-transparent group-hover:via-amber-500/50 transition-all duration-500" />
                
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Calculate Automation ROI</span>
                </div>
                <span className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">Discover exactly how much time and money you will save by automating onboarding.</span>
              </button>

              <button 
                onClick={() => onSendMessage && onSendMessage("What is the best way to sync Stripe payments to my accounting software?")}
                className="group relative flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.04] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-500" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/0 to-transparent group-hover:via-amber-500/50 transition-all duration-500" />
                
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Sync Stripe Payments</span>
                </div>
                <span className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">Automatically push Stripe transactions into QuickBooks or Xero in real-time.</span>
              </button>
            </motion.div>
          </motion.div>
        )}

        {messages.length > 1 && messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } group`}
          >
            {message.role === 'user' && !isLoading && editingId !== message.id && (
              <div className="mr-2 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingId(message.id);
                    setEditText(message.text);
                  }}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                  title="Edit message"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            <div
              className={`max-w-[85%] px-5 py-3.5 text-sm leading-relaxed sm:max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-[#2a2e3a] to-[#1a1d24] text-gray-100 shadow-[0_8px_25px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-inset ring-white/5 rounded-[24px] rounded-tr-sm'
                  : 'bg-transparent text-gray-200 pl-1'
              }`}
            >
              {editingId === message.id ? (
                <div className="flex flex-col gap-2 min-w-[250px]">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full resize-none rounded-lg bg-black/20 p-2 text-sm text-white outline-none border border-white/10 focus:border-amber-500/50"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (editText.trim() && onEditMessage) {
                          onEditMessage(message.id, editText.trim());
                        }
                        setEditingId(null);
                      }}
                      className="rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-amber-500"
                    >
                      Save & Submit
                    </button>
                  </div>
                </div>
              ) : (
                <div className={message.role === 'user' ? 'whitespace-pre-wrap' : 'prose prose-invert prose-sm max-w-none'}>
                  {message.role === 'user' ? (
                    message.text
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{ 
                        code: CodeBlock,
                        li: (props) => <BlurredListItem {...props} onScheduleClick={onScheduleClick} />
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  )}
                </div>
              )}

              {message.recommendation && editingId !== message.id && (
                <button
                  onClick={() => router.push('/report')}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Detailed Report
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-surface px-4 py-3 text-sm text-gray-400 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
              <Loader2 className="h-4 w-4 animate-spin-slow text-amber-500" />
              <span>AI is analyzing...</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
