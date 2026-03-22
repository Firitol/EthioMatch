'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Message } from '@/lib/db';
import { useAuth } from '@/app/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ImageIcon, Video, X, Coins, Crown, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatInterfaceProps {
  currentUser: User;
  otherUser: User;
  conversationId: string;
}

export function ChatInterface({ currentUser, otherUser, conversationId }: ChatInterfaceProps) {
  const { refreshUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [localCurrentUser, setLocalCurrentUser] = useState<User>(currentUser);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/messages?conversationId=${conversationId}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          
          // Mark as read
          await fetch('/api/messages', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              userId: currentUser.id,
            }),
          });
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [conversationId, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !mediaPreview) return;

    try {
      // Send message via API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: currentUser.id,
          receiverId: otherUser.id,
          content: newMessage,
          mediaUrl: mediaPreview?.url,
          mediaType: mediaPreview?.type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          setShowUpgradePrompt(true);
          return;
        }
        throw new Error(error.error || 'Failed to send message');
      }

      const newMsg = await response.json();
      setMessages([...messages, newMsg]);
      setNewMessage('');
      setMediaPreview(null);
      refreshUser();

      // Fetch updated user data
      const userResponse = await fetch(`/api/users?id=${currentUser.id}`);
      if (userResponse.ok) {
        const updatedUser = await userResponse.json();
        setLocalCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileSelect = (file: File, type: 'image' | 'video') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setMediaPreview({ url, type });
    };
    reader.readAsDataURL(file);
  };

  const handleUpgradePremium = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          is_premium: true,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setLocalCurrentUser(updatedUser);
        refreshUser();
        setShowUpgradePrompt(false);
      }
    } catch (error) {
      console.error('Failed to upgrade:', error);
    }
  };

  const handleBuyTokens = async (amount: number) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          tokens: localCurrentUser.tokens + amount,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setLocalCurrentUser(updatedUser);
        refreshUser();
        setShowUpgradePrompt(false);
      }
    } catch (error) {
      console.error('Failed to buy tokens:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen md:h-[600px] bg-white md:rounded-lg md:border md:border-gray-200 md:shadow-lg">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex-1">
          <h2 className="font-bold text-base md:text-lg text-gray-900">{otherUser.name}</h2>
          <p className="text-xs md:text-sm text-gray-600">{otherUser.location}</p>
        </div>
        {/* Token/Premium indicator */}
        <div className="flex items-center gap-2 ml-2">
          {localCurrentUser.isPremium ? (
            <span className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <Crown className="w-3 h-3" />
              <span className="hidden sm:inline">Premium</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
              <Coins className="w-3 h-3" />
              {localCurrentUser.tokens}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm md:text-base">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm md:text-base">No messages yet. Start the conversation!</p>
            {!currentUser.isPremium && (
              <p className="text-xs mt-2 text-amber-600">Each message costs 1 token</p>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 md:px-4 py-2 rounded-2xl shadow-sm text-sm md:text-base ${
                  msg.senderId === currentUser.id
                    ? 'bg-red-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                }`}
              >
                {msg.mediaUrl && msg.mediaType === 'image' && (
                  <img
                    src={msg.mediaUrl}
                    alt="Sent image"
                    className="max-w-full rounded-lg mb-2"
                  />
                )}
                {msg.mediaUrl && msg.mediaType === 'video' && (
                  <video
                    src={msg.mediaUrl}
                    controls
                    className="max-w-full rounded-lg mb-2"
                  />
                )}
                {msg.content && <p>{msg.content}</p>}
                <p
                  className={`text-xs mt-1 ${
                    msg.senderId === currentUser.id ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* No tokens warning */}
      {!localCurrentUser.isPremium && localCurrentUser.tokens === 0 && (
        <div className="px-3 md:px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center gap-2 text-xs md:text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-800">No tokens. Buy more to message.</p>
          <button
            onClick={() => setShowUpgradePrompt(true)}
            className="ml-auto font-medium text-amber-700 hover:text-amber-800 underline"
          >
            Get tokens
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-gray-200 space-y-2 md:space-y-3 bg-white">
        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative inline-block max-w-full">
            {mediaPreview.type === 'image' ? (
              <img
                src={mediaPreview.url}
                alt="Preview"
                className="max-w-full md:max-w-xs rounded-lg"
              />
            ) : (
              <video
                src={mediaPreview.url}
                className="max-w-full md:max-w-xs rounded-lg"
                controls
              />
            )}
            <button
              onClick={() => setMediaPreview(null)}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Field */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={localCurrentUser.isPremium ? "Message..." : `Message... (${localCurrentUser.tokens})`}
            className="flex-1 text-sm"
            disabled={!localCurrentUser.isPremium && localCurrentUser.tokens === 0}
          />
          <label className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition flex-shrink-0">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0], 'image');
                }
              }}
              className="hidden"
            />
          </label>
          <label className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition flex-shrink-0">
            <Video className="w-5 h-5 text-gray-600" />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0], 'video');
                }
              }}
              className="hidden"
            />
          </label>
          <Button
            onClick={handleSendMessage}
            className="bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 flex-shrink-0"
            disabled={!localCurrentUser.isPremium && localCurrentUser.tokens === 0}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  Need More Messages?
                </h3>
                <button
                  onClick={() => setShowUpgradePrompt(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                You need tokens to send messages. Choose an option below:
              </p>

              {/* Premium Option */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg text-white mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-6 h-6" />
                  <div>
                    <h4 className="font-bold">Premium - Unlimited</h4>
                    <p className="text-sm text-purple-100">$9.99/month</p>
                  </div>
                </div>
                <Button
                  onClick={handleUpgradePremium}
                  className="w-full bg-white text-purple-600 hover:bg-purple-50 mt-2"
                >
                  Upgrade Now
                </Button>
              </div>

              {/* Token Options */}
              <p className="text-sm font-medium text-gray-700 mb-2">Or buy tokens:</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { amount: 10, price: '$0.99' },
                  { amount: 50, price: '$3.99' },
                  { amount: 100, price: '$6.99' },
                ].map(({ amount, price }) => (
                  <button
                    key={amount}
                    onClick={() => handleBuyTokens(amount)}
                    className="p-3 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition text-center"
                  >
                    <Coins className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="font-bold text-gray-900">{amount}</p>
                    <p className="text-xs text-gray-500">{price}</p>
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Demo mode: Click to instantly add tokens
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
