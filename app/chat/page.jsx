'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import AuthGate from '@/components/AuthGate';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import ChatArea from '@/components/ChatArea';
import ChatInput from '@/components/ChatInput';
import { getAuth } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import useFirebaseAuth from '@/components/useFirebaseAuth';
import ScheduleModal from '@/components/ScheduleModal';
import SettingsModal from '@/components/SettingsModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    role: 'ai',
    text: 'Hi there! Tell me about your business and the biggest operational bottleneck you are facing right now.',
  },
];

export default function ChatPage() {
  const { signOut } = useFirebaseAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState('profile');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const messagesRef = useRef(INITIAL_MESSAGES);

  // QA FIX: Replaced Math.random() with a stable fallback key (index) to prevent
  // entire message components from remounting and flickering during real-time streaming updates.
  const messageList = useMemo(
    () => messages.map((m, index) => ({ ...m, id: m.id || `msg-${index}-${m.role}` })),
    [messages]
  );

  async function fetchSidebarConversations() {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    if (!token) return [];

    let fetchedSessions = [];
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        fetchedSessions = data.conversations || [];
      }
    } catch (e) {
      console.error("Failed to fetch sidebar conversations:", e);
    }

    // Apply LocalStorage overrides for frontend persistence when backend is failing
    try {
      const deletedIds = JSON.parse(localStorage.getItem('dhandho_deleted_sessions') || '[]');
      const renames = JSON.parse(localStorage.getItem('dhandho_renamed_sessions') || '{}');
      
      fetchedSessions = fetchedSessions
        .filter(session => !deletedIds.includes(session.id))
        .map(session => ({
          ...session,
          title: renames[session.id] || session.title
        }));
    } catch (e) {
      console.error("Error applying local storage overrides:", e);
    }

    return fetchedSessions;
  }

  async function loadChatHistory(sessionId) {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    if (!token) return;

    // Fast-path: If the session was just created locally (and set to INITIAL_MESSAGES), 
    // we don't need to fetch from the backend. This prevents a race condition where 
    // a delayed 404 response wipes out a message the user typed instantly.
    if (messagesRef.current.length === 1 && messagesRef.current[0].id === 'welcome') {
      const isNewLocalSession = sessions.find(s => s.id === sessionId && s.title === 'New conversation');
      if (isNewLocalSession) {
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${sessionId}/history`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const history = data.history || data.conversation_history || [];
        if (history.length > 0) {
          setMessages(history);
          messagesRef.current = history;
        } else {
          setMessages(INITIAL_MESSAGES);
          messagesRef.current = INITIAL_MESSAGES;
        }
      } else {
        // Only set to initial if we actually got a 404 AND we haven't typed yet
        if (messagesRef.current.length <= 1) {
          setMessages(INITIAL_MESSAGES);
          messagesRef.current = INITIAL_MESSAGES;
        }
      }
    } catch (e) {
      console.error("Failed to fetch chat history:", e);
    }
  }

  useEffect(() => {
    if (!currentUser) return;
    
    fetchSidebarConversations().then(loadedSessions => {
      setSessions(loadedSessions);
      if (loadedSessions.length > 0 && !activeSessionId) {
        setActiveSessionId(loadedSessions[0].id);
      } else if (loadedSessions.length === 0) {
        handleNewChat();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (activeSessionId && currentUser) {
      loadChatHistory(activeSessionId);
    }
  }, [activeSessionId, currentUser]);


  const abortControllerRef = useRef(null);

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (userText) => {
    if (!userText.trim() || !currentUser || !activeSessionId) return;

    const userMsg = { id: `user-${Date.now()}`, role: 'user', text: userText };
    setMessages((prev) => {
      const next = [...prev, userMsg];
      messagesRef.current = next;
      return next;
    });

    setIsLoading(true);

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      const headers = { "Content-Type": "application/json" };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          session_id: activeSessionId,
          message: userText,
          conversation_history: messagesRef.current.filter((m) => m.id !== 'welcome').map(m => ({ role: m.role, text: m.text }))
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a minute.");
        } else if (response.status === 500 || response.status === 502) {
          throw new Error("The server is currently unavailable. Please try again later.");
        }
        const errText = await response.text();
        throw new Error(errText || 'Failed to communicate with backend');
      }

      // Check if response is Server-Sent Events (streaming)
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream")) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let aiMessageText = "";
        
        // Add an empty AI message that we will stream into
        const aiMsgId = `ai-${Date.now()}`;
        setMessages((prev) => {
          const next = [...prev, { id: aiMsgId, role: 'ai', text: '' }];
          messagesRef.current = next;
          return next;
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.startsWith('data:')) {
              const dataStr = line.replace(/^data:\s*/, '').trim();
              if (dataStr === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(dataStr);
                
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                
                // If backend streams the full history array at the end
                if (parsed.conversation_history) {
                  setMessages(parsed.conversation_history);
                  messagesRef.current = parsed.conversation_history;
                  continue;
                }
                
                // If backend streams token by token or sends a full 'conversational' reply
                // We add parsed.reply and parsed.response to support the backend's status objects
                const tokenText = parsed.chunk || parsed.token || parsed.text || parsed.delta || parsed.reply || parsed.response || "";
                if (tokenText) {
                  // If the backend sends the FULL message at once under 'reply', replace the text entirely.
                  // Otherwise, if it's sending chunks, append them.
                  if (parsed.status === 'conversational' || parsed.reply) {
                    aiMessageText = tokenText; 
                  } else {
                    aiMessageText += tokenText;
                  }
                  
                  setMessages((prev) => {
                    const next = [...prev];
                    const aiIdx = next.findIndex(m => m.id === aiMsgId);
                    if (aiIdx !== -1) {
                      next[aiIdx].text = aiMessageText;
                      // Handle recommendations if present
                      if (parsed.tool_recommendations || parsed.recommendations) {
                        next[aiIdx].recommendation = true;
                      }
                    }
                    messagesRef.current = next;
                    return next;
                  });
                }
              } catch (e) {
                // If it's not valid JSON or another streaming error, ignore the chunk
              }
            }
          }
        }
      } else {
        // Fallback for standard JSON response
        const textResponse = await response.text();
        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          if (textResponse.startsWith('data:')) {
             const jsonString = textResponse.replace(/^data:\s*/, '').split('\n')[0];
             data = JSON.parse(jsonString);
          } else {
             throw new Error("Invalid response from server");
          }
        }

        if (data.error) throw new Error(data.error);

        // Standard JSON handling
        if (data.conversation_history) {
          setMessages(data.conversation_history);
          messagesRef.current = data.conversation_history;
        } else if (data.status === 'conversational' || data.reply || data.response) {
          const aiMsgId = `ai-${Date.now()}`;
          const aiMsgText = data.reply || data.response || data.text || "";
          setMessages((prev) => {
            const next = [...prev, { id: aiMsgId, role: 'ai', text: aiMsgText, recommendation: !!data.tool_recommendations }];
            messagesRef.current = next;
            return next;
          });
        }
      }
      
      // refresh sidebar so title updates if needed
      fetchSidebarConversations().then(setSessions);

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log("Stream stopped by user");
        setIsLoading(false);
        return;
      }
      console.error("Chat Error:", err);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: `Error: ${err.message || 'I could not connect to the backend server. Please try again.'}`,
      };
      setMessages((prev) => {
        const next = [...prev, aiMsg];
        messagesRef.current = next;
        return next;
      });
    }

    setIsLoading(false);
  };

  const handleEditMessage = (messageId, newText) => {
    if (isLoading) return; // Prevent editing while loading
    const msgIndex = messagesRef.current.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    // Slice history up to (but not including) the edited message
    const newHistory = messagesRef.current.slice(0, msgIndex);
    setMessages(newHistory);
    messagesRef.current = newHistory;

    // Send the edited text
    handleSendMessage(newText);
  };

  const handleNewChat = () => {
    // 1. Instantly stop any AI generation from bleeding into the new chat
    handleStopGenerating();
    
    // 2. Prevent creating multiple empty chats and piling them up in the sidebar
    if (messagesRef.current.length <= 1) {
      // We are already on an empty chat, just focus it
      return; 
    }

    // 3. Clean up any previous empty 'New conversation' sessions before creating a new one
    const newSessionId = `session-${Date.now()}`;
    setSessions((prev) => {
      const filtered = prev.filter(s => s.title !== 'New conversation' && s.title !== 'New Chat');
      return [{ id: newSessionId, title: 'New conversation' }, ...filtered];
    });
    
    setActiveSessionId(newSessionId);
    setMessages(INITIAL_MESSAGES);
    messagesRef.current = INITIAL_MESSAGES;
  };

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
  };

  const handleRenameSession = async (sessionId, newTitle) => {
    // Optimistic UI Update
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s)));
    
    // Save to localStorage to persist across refreshes if backend fails
    try {
      const renames = JSON.parse(localStorage.getItem('dhandho_renamed_sessions') || '{}');
      renames[sessionId] = newTitle;
      localStorage.setItem('dhandho_renamed_sessions', JSON.stringify(renames));
    } catch (e) {
      console.error(e);
    }

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/conversations/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle })
      });

      if (!response.ok) {
        console.warn("Backend failed to rename session. (Optimistic update kept)");
      }
    } catch (e) {
      console.error("Failed to rename session on backend:", e);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    // Optimistic UI Update
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0].id);
        } else {
          // Handled below
        }
      }
      return updated;
    });

    // Save to localStorage to persist across refreshes if backend fails
    try {
      const deleted = JSON.parse(localStorage.getItem('dhandho_deleted_sessions') || '[]');
      if (!deleted.includes(sessionId)) {
        deleted.push(sessionId);
        localStorage.setItem('dhandho_deleted_sessions', JSON.stringify(deleted));
      }
    } catch (e) {
      console.error(e);
    }

    // Handle active session switch if we deleted the current one
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/conversations/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn("Backend failed to delete session. (Optimistic update kept)");
      }
    } catch (e) {
      console.error("Failed to delete session on backend:", e);
    }
  };

  return (
    <AuthGate>
      {({ user }) => {
        if (!currentUser) setCurrentUser(user);
        
        return (
          <div className="flex h-screen bg-base text-white">
            <Sidebar
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen((open) => !open)}
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onRenameSession={handleRenameSession}
              onDeleteSession={handleDeleteSession}
              user={user}
              onLogoutClick={() => setShowLogoutModal(true)}
              onSettingsClick={(tab = 'profile') => {
                setSettingsModalTab(tab);
                setShowSettingsModal(true);
              }}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
              <TopNavbar 
                sidebarOpen={sidebarOpen} 
                onToggleSidebar={() => setSidebarOpen(true)}
                user={user} 
                onLogoutClick={() => setShowLogoutModal(true)}
                onSettingsClick={(tab) => {
                  setSettingsModalTab(tab);
                  setShowSettingsModal(true);
                }}
              />
              <main className="flex flex-1 flex-col overflow-hidden relative">
                <div className="flex flex-1 flex-col overflow-hidden">
                  <ChatArea 
                    messages={messageList} 
                    isLoading={isLoading} 
                    onSendMessage={handleSendMessage} 
                    onEditMessage={handleEditMessage} 
                    onScheduleClick={() => setShowScheduleModal(true)}
                  />
                  <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} onStop={handleStopGenerating} />
                </div>
              </main>
            </div>

            <AnimatePresence>
              {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#111] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-inset ring-white/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                    <h3 className="mb-3 text-xl font-bold tracking-tight text-white">Sign out of Dhandho AI?</h3>
                    <p className="mb-6 text-sm text-gray-400">You will need to sign back in to access your secure consultation history.</p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowLogoutModal(false)}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setShowLogoutModal(false);
                          await signOut();
                          window.location.href = '/';
                        }}
                        className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/30 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {showSettingsModal && (
                <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} initialTab={settingsModalTab} />
              )}

              {showScheduleModal && (
                <ScheduleModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} />
              )}
            </AnimatePresence>
          </div>
        );
      }}
    </AuthGate>
  );
}
