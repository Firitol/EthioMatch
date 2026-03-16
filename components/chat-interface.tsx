'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Message, Database } from '@/lib/db';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allMessages = Database.getMessages();
    const conversationMessages = allMessages.filter((m) => m.conversationId === conversationId);
    setMessages(conversationMessages.sort((a, b) => a.createdAt - b.createdAt));

    // Mark messages as read
    const updated = allMessages.map((m) =>
      m.conversationId === conversationId && m.receiverId === currentUser.id
        ? { ...m, read: true }
        : m
    );
    Database.saveMessages(updated);
  }, [conversationId, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !mediaPreview) return;

    // Check if user can send message (has tokens or is premium)
    if (!Database.canSendMessage(currentUser.id)) {
      setShowUpgradePrompt(true);
      return;
    }

    // Use a token (premium users don't consume tokens)
    const tokenUsed = Database.useToken(currentUser.id);
    if (!tokenUsed && !currentUser.isPremium) {
      setShowUpgradePrompt(true);
      return;
    }

    // Update local user state
    const updatedUser = Database.getCurrentUser();
    if (updatedUser) {
      setLocalCurrentUser(updatedUser);
    }

    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      receiverId: otherUser.id,
      content: newMessage,
      mediaUrl: mediaPreview?.url,
      mediaType: mediaPreview?.type,
      createdAt: Date.now(),
      read: false,
    };

    const allMessages = Database.getMessages();
    allMessages.push(message);
    Database.saveMessages(allMessages);

    setMessages([...messages, message]);
    setNewMessage('');
    setMediaPreview(null);
    refreshUser();
  };

  const handleFileSelect = (file: File, type: 'image' | 'video') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setMediaPreview({ url, type });
    };
    reader.readAsDataURL(file);
  };

  const handleUpgradePremium = () => {
    Database.upgradeToPremium(currentUser.id);
    const updatedUser = Database.getCurrentUser();
    if (updatedUser) {
      setLocalCurrentUser(updatedUser);
    }
    refreshUser();
    setShowUpgradePrompt(false);
  };

  const handleBuyTokens = (amount: number) => {
    Database.addTokens(currentUser.id, amount);
    const updatedUser = Database.getCurrentUser();
    if (updatedUser) {
      setLocalCurrentUser(updatedUser);
    }
    refreshUser();
    setShowUpgradePrompt(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-gray-900">{otherUser.name}</h2>
          <p className="text-sm text-gray-600">{otherUser.location}</p>
        </div>
        {/* Token/Premium indicator */}
        <div className="flex items-center gap-2">
          {localCurrentUser.isPremium ? (
            <span className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
              <Coins className="w-3 h-3" />
              {localCurrentUser.tokens} left
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
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
                className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${
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
                {msg.content && <p className="text-sm">{msg.content}</p>}
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
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-800">You have no tokens left. Buy more to continue messaging.</p>
          <button
            onClick={() => setShowUpgradePrompt(true)}
            className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-800 underline"
          >
            Get tokens
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 space-y-3 bg-white">
        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative inline-block">
            {mediaPreview.type === 'image' ? (
              <img
                src={mediaPreview.url}
                alt="Preview"
                className="max-w-xs rounded-lg"
              />
            ) : (
              <video
                src={mediaPreview.url}
                className="max-w-xs rounded-lg"
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
            placeholder={localCurrentUser.isPremium ? "Type a message..." : `Type a message... (${localCurrentUser.tokens} tokens left)`}
            className="flex-1"
            disabled={!localCurrentUser.isPremium && localCurrentUser.tokens === 0}
          />
          <label className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition">
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
          <label className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition">
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
            className="bg-red-500 hover:bg-red-600 text-white px-4"
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
