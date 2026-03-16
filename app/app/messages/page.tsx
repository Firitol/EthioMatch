'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth-context';
import { useRouter } from 'next/navigation';
import { Database, User, Message, Conversation } from '@/lib/db';
import { ChatInterface } from '@/components/chat-interface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [matchedUsers, setMatchedUsers] = useState<User[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [otherUsers, setOtherUsers] = useState<Map<string, User>>(new Map());
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Load conversations
    const allConversations = Database.getConversations();

    const userConversations = allConversations.filter(
      (c) => c.participants[0] === currentUser.id || c.participants[1] === currentUser.id
    );

    setConversations(userConversations);

    // Load other users and unread counts
    const users = Database.getUsers();
    const userMap = new Map<string, User>();
    const messages = Database.getMessages();

    const counts = new Map<string, number>();
    userConversations.forEach((conv) => {
      const otherUserId = conv.participants[0] === currentUser.id ? conv.participants[1] : conv.participants[0];
      const user = users.find((u) => u.id === otherUserId);
      if (user) {
        userMap.set(otherUserId, user);
      }

      const unreadCount = messages.filter(
        (m) =>
          m.conversationId === conv.id &&
          m.receiverId === currentUser.id &&
          !m.read
      ).length;
      counts.set(conv.id, unreadCount);
    });

    setOtherUsers(userMap);
    setUnreadCounts(counts);

    // Load matched users (mutual likes) that don't have conversations yet
    const allMatches = Database.getMatches();
    const allUsers = Database.getUsers();

    // Find mutual matches
    const mutualMatches = new Set<string>();
    allMatches.forEach((match) => {
      if (match.userId === currentUser.id && match.status === 'matched') {
        mutualMatches.add(match.matchedUserId);
      }
      if (match.matchedUserId === currentUser.id && match.status === 'matched') {
        mutualMatches.add(match.userId);
      }
    });

    // Get matched users that aren't already in conversations
    const matchedUsersList = Array.from(mutualMatches)
      .map((userId) => allUsers.find((u) => u.id === userId))
      .filter((user) => {
        if (!user) return false;
        const hasConversation = userConversations.some(
          (c) =>
            (c.participants[0] === user.id && c.participants[1] === currentUser.id) ||
            (c.participants[0] === currentUser.id && c.participants[1] === user.id)
        );
        return !hasConversation;
      }) as User[];

    setMatchedUsers(matchedUsersList);
  }, [currentUser, router]);

  const handleStartConversation = (userId: string) => {
    if (!currentUser) return;

    const participants: [string, string] = [currentUser.id, userId].sort() as [string, string];
    let conversation = conversations.find(
      (c) =>
        (c.participants[0] === participants[0] && c.participants[1] === participants[1]) ||
        (c.participants[0] === participants[1] && c.participants[1] === participants[0])
    );

    if (!conversation) {
      conversation = {
        id: `conv-${Date.now()}`,
        participants,
        createdAt: Date.now(),
      };

      const allConversations = Database.getConversations();
      allConversations.push(conversation);
      Database.saveConversations(allConversations);
      setConversations([...conversations, conversation]);
    }

    setSelectedConversation(conversation);
  };

  const getOtherUser = (conversation: Conversation): User | undefined => {
    const otherUserId =
      conversation.participants[0] === currentUser?.id
        ? conversation.participants[1]
        : conversation.participants[0];
    return otherUsers.get(otherUserId);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {selectedConversation && getOtherUser(selectedConversation) ? (
          // Chat View
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedConversation(null)}
              className="flex items-center gap-2 text-gray-600 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Messages
            </Button>
            <ChatInterface
              currentUser={currentUser}
              otherUser={getOtherUser(selectedConversation)!}
              conversationId={selectedConversation.id}
            />
          </div>
        ) : (
          // Conversations List
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Matched Users - Quick Start */}
            <div className="lg:col-span-1 space-y-4">
              {/* New Matches */}
              {matchedUsers.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-900">
                      <Heart className="w-5 h-5 text-green-600 fill-green-600" />
                      New Matches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {matchedUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleStartConversation(user.id)}
                          className="w-full text-left p-3 rounded-lg hover:bg-green-100 transition border border-transparent hover:border-green-300 bg-white"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-600">{user.location}</p>
                              <p className="text-xs text-green-600 mt-1 font-medium">Start chatting →</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Active Conversations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {conversations.length === 0 ? (
                      <p className="text-sm text-gray-600">No conversations yet</p>
                    ) : (
                      conversations.map((conv) => {
                        const otherUser = getOtherUser(conv);
                        if (!otherUser) return null;
                        const unreadCount = unreadCounts.get(conv.id) || 0;

                        return (
                          <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{otherUser.name}</p>
                                <p className="text-xs text-gray-600">{otherUser.location}</p>
                              </div>
                              {unreadCount > 0 && (
                                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Conversations View */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {conversations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">💬</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                      <p className="text-gray-600 mb-6">
                        Start matching and messaging to build connections!
                      </p>
                      <Button
                        onClick={() => router.push('/app/discover')}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Back to Discover
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {conversations.map((conv) => {
                        const otherUser = getOtherUser(conv);
                        if (!otherUser) return null;
                        const unreadCount = unreadCounts.get(conv.id) || 0;

                        return (
                          <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition ${
                              unreadCount > 0
                                ? 'bg-red-50 border-red-200 hover:bg-red-100'
                                : 'bg-white border-transparent hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
                                <p className="text-sm text-gray-600">{otherUser.location}</p>
                                {otherUser.relationshipGoal === 'marriage' && (
                                  <p className="text-xs text-red-600 mt-1">💍 Looking for Marriage</p>
                                )}
                              </div>
                              {unreadCount > 0 && (
                                <span className="ml-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
