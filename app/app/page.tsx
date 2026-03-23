'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth-context';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, User, Coins, Crown, Sparkles, Users } from 'lucide-react';
import { Database } from '@/lib/db';

export default function AppHome() {
  const router = useRouter();
  const { currentUser, isLoading, refreshUser } = useAuth();
  const [matchCount, setMatchCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      console.log('[v0] No current user, redirecting to login');
      router.push('/login');
    }
  }, [currentUser, isLoading, router]);

  useEffect(() => {
    if (currentUser) {
      const matches = Database.getMatches();
      const userMatches = matches.filter(
        m => (m.userId === currentUser.id || m.matchedUserId === currentUser.id) && m.status === 'matched'
      );
      setMatchCount(userMatches.length);

      const conversations = Database.getConversations();
      const userConvs = conversations.filter(
        c => c.participants.includes(currentUser.id)
      );
      setConversationCount(userConvs.length);
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }


  const handleUpgradePremium = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          isPremium: true,
        }),
      });
      if (response.ok) {
        console.log('[v0] Premium upgrade successful');
        await refreshUser();
        setShowPremiumModal(false);
      } else {
        console.error('[v0] Premium upgrade failed:', response.status);
      }
    } catch (error) {
      console.error('[v0] Failed to upgrade:', error);
    }
  };

  const handleBuyTokens = async (amount: number) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          tokens: currentUser.tokens + amount,
        }),
      });
      if (response.ok) {
        console.log('[v0] Tokens purchase successful');
        await refreshUser();
        setShowPremiumModal(false);
      } else {
        console.error('[v0] Token purchase failed:', response.status);
      }
    } catch (error) {
      console.error('[v0] Failed to buy tokens:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 pb-20 md:pb-8">
      {/* Main Content */}
      <main className="w-full md:max-w-6xl md:mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
            Welcome back, {currentUser.name}!
          </h2>
          <p className="text-sm md:text-base text-gray-600">Ready to find your perfect match today?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                <Heart className="w-4 md:w-5 h-4 md:h-5 text-red-500" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{matchCount}</p>
              <p className="text-xs md:text-sm text-gray-600">Matches</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                <MessageCircle className="w-4 md:w-5 h-4 md:h-5 text-blue-500" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{conversationCount}</p>
              <p className="text-xs md:text-sm text-gray-600">Conversations</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                <Coins className="w-4 md:w-5 h-4 md:h-5 text-amber-500" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {currentUser.isPremium ? '∞' : currentUser.tokens}
              </p>
              <p className="text-xs md:text-sm text-gray-600">Tokens</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2">
                <Users className="w-4 md:w-5 h-4 md:h-5 text-green-500" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{currentUser.photos.length}</p>
              <p className="text-xs md:text-sm text-gray-600">Photos</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Discover Card */}
          <Card className="bg-white border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 p-4 md:p-6 text-white">
              <Heart className="w-8 md:w-10 h-8 md:h-10 mb-2 md:mb-3" />
              <h3 className="text-lg md:text-xl font-bold mb-1">Discover Matches</h3>
              <p className="text-xs md:text-sm text-red-100">Swipe through profiles and find your perfect match</p>
            </div>
            <CardContent className="p-3 md:p-4">
              <Button
                onClick={() => router.push('/app/discover')}
                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm"
              >
                Start Swiping
              </Button>
            </CardContent>
          </Card>

          {/* Messages Card */}
          <Card className="bg-white border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 md:p-6 text-white">
              <MessageCircle className="w-8 md:w-10 h-8 md:h-10 mb-2 md:mb-3" />
              <h3 className="text-lg md:text-xl font-bold mb-1">Your Messages</h3>
              <p className="text-xs md:text-sm text-blue-100">Chat with your matches and build connections</p>
            </div>
            <CardContent className="p-3 md:p-4">
              <Button
                onClick={() => router.push('/app/messages')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm"
              >
                View Messages
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Premium Upgrade Banner */}
        {!currentUser.isPremium && (
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-lg text-white overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4 flex-1">
                  <div className="w-12 md:w-14 h-12 md:h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 md:w-7 h-6 md:h-7" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-xl font-bold mb-0 md:mb-1">Upgrade to Premium</h3>
                    <p className="text-xs md:text-sm text-purple-100">Unlimited messages, priority matching, and more!</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowPremiumModal(true)}
                  className="bg-white text-purple-600 hover:bg-purple-50 text-sm w-full md:w-auto"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Summary */}
        <Card className="bg-white border-0 shadow-lg mt-4 md:mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <User className="w-5 h-5 text-gray-600" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Looking for</p>
                <p className="text-sm md:text-base font-medium text-gray-900 capitalize">
                  {currentUser.relationshipGoal === 'marriage' && 'Marriage'}
                  {currentUser.relationshipGoal === 'serious' && 'Serious Relationship'}
                  {currentUser.relationshipGoal === 'dating' && 'Dating'}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Location</p>
                <p className="text-sm md:text-base font-medium text-gray-900">{currentUser.location}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Age</p>
                <p className="text-sm md:text-base font-medium text-gray-900">{currentUser.age} years</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500">Account Status</p>
                <p className={`text-sm md:text-base font-medium ${currentUser.isPremium ? 'text-purple-600' : 'text-gray-900'}`}>
                  {currentUser.isPremium ? 'Premium' : 'Free'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/app/profile')}
              variant="outline"
              className="mt-3 md:mt-2 text-sm"
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Premium/Token Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-3 md:p-4">
          <Card className="bg-white w-full max-w-md rounded-t-3xl md:rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Crown className="w-5 h-5 text-purple-500" />
                  Get More Messages
                </CardTitle>
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-xs md:text-sm">
                You have <strong>{currentUser.tokens} tokens</strong> remaining. Each message costs 1 token.
              </p>

              {/* Premium Option */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 md:p-4 rounded-lg text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="w-7 md:w-8 h-7 md:h-8" />
                  <div>
                    <h4 className="font-bold text-sm md:text-base">Premium - Unlimited</h4>
                    <p className="text-xs md:text-sm text-purple-100">$9.99/month</p>
                  </div>
                </div>
                <ul className="text-xs md:text-sm space-y-1 mb-4 text-purple-100">
                  <li>Unlimited messages</li>
                  <li>Priority in discover</li>
                  <li>See who liked you</li>
                </ul>
                <Button
                  onClick={handleUpgradePremium}
                  className="w-full bg-white text-purple-600 hover:bg-purple-50 text-sm"
                >
                  Upgrade to Premium
                </Button>
              </div>

              {/* Token Packages */}
              <div className="space-y-2">
                <p className="text-xs md:text-sm font-medium text-gray-700">Or buy token packs:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleBuyTokens(10)}
                    className="p-2 md:p-3 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition text-center"
                  >
                    <Coins className="w-5 md:w-6 h-5 md:h-6 text-amber-500 mx-auto mb-1" />
                    <p className="font-bold text-sm text-gray-900">10</p>
                    <p className="text-xs text-gray-500">$0.99</p>
                  </button>
                  <button
                    onClick={() => handleBuyTokens(50)}
                    className="p-2 md:p-3 border-2 border-amber-300 rounded-lg hover:bg-amber-50 transition text-center bg-amber-50"
                  >
                    <Coins className="w-5 md:w-6 h-5 md:h-6 text-amber-500 mx-auto mb-1" />
                    <p className="font-bold text-sm text-gray-900">50</p>
                    <p className="text-xs text-gray-500">$3.99</p>
                  </button>
                  <button
                    onClick={() => handleBuyTokens(100)}
                    className="p-2 md:p-3 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition text-center"
                  >
                    <Coins className="w-5 md:w-6 h-5 md:h-6 text-amber-500 mx-auto mb-1" />
                    <p className="font-bold text-sm text-gray-900">100</p>
                    <p className="text-xs text-gray-500">$6.99</p>
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Demo: Clicking will instantly add tokens/premium
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
