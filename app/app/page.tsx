'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth-context';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, User, LogOut, Coins, Crown, Sparkles, Users } from 'lucide-react';
import { Database } from '@/lib/db';

export default function AppHome() {
  const router = useRouter();
  const { currentUser, isLoading, logout, refreshUser } = useAuth();
  const [matchCount, setMatchCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !currentUser) {
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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleUpgradePremium = () => {
    const updated = Database.upgradeToPremium(currentUser.id);
    if (updated) {
      refreshUser();
      setShowPremiumModal(false);
    }
  };

  const handleBuyTokens = (amount: number) => {
    Database.addTokens(currentUser.id, amount);
    refreshUser();
    setShowPremiumModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500 fill-red-500" />
              <h1 className="text-xl font-bold text-gray-900">Ethiomatch</h1>
            </div>

            {/* Token/Premium Display */}
            <div className="flex items-center gap-3">
              {currentUser.isPremium ? (
                <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  <span>Premium</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-amber-200 transition"
                >
                  <Coins className="w-4 h-4" />
                  <span>{currentUser.tokens} tokens</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 mt-3 -mb-px overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/app/discover')}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <Heart className="w-4 h-4" />
              <span>Discover</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/app/messages')}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Messages</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/app/profile')}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 ml-auto"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser.name}!
          </h2>
          <p className="text-gray-600">Ready to find your perfect match today?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{matchCount}</p>
              <p className="text-sm text-gray-600">Matches</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{conversationCount}</p>
              <p className="text-sm text-gray-600">Conversations</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Coins className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {currentUser.isPremium ? '∞' : currentUser.tokens}
              </p>
              <p className="text-sm text-gray-600">Tokens</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{currentUser.photos.length}</p>
              <p className="text-sm text-gray-600">Photos</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Discover Card */}
          <Card className="bg-white border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6 text-white">
              <Heart className="w-10 h-10 mb-3" />
              <h3 className="text-xl font-bold mb-1">Discover Matches</h3>
              <p className="text-red-100">Swipe through profiles and find your perfect match</p>
            </div>
            <CardContent className="p-4">
              <Button
                onClick={() => router.push('/app/discover')}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                Start Swiping
              </Button>
            </CardContent>
          </Card>

          {/* Messages Card */}
          <Card className="bg-white border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
              <MessageCircle className="w-10 h-10 mb-3" />
              <h3 className="text-xl font-bold mb-1">Your Messages</h3>
              <p className="text-blue-100">Chat with your matches and build connections</p>
            </div>
            <CardContent className="p-4">
              <Button
                onClick={() => router.push('/app/messages')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                View Messages
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Premium Upgrade Banner */}
        {!currentUser.isPremium && (
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-lg text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Crown className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Upgrade to Premium</h3>
                    <p className="text-purple-100">Unlimited messages, priority matching, and more!</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowPremiumModal(true)}
                  className="bg-white text-purple-600 hover:bg-purple-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Summary */}
        <Card className="bg-white border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Looking for</p>
                <p className="font-medium text-gray-900 capitalize">
                  {currentUser.relationshipGoal === 'marriage' && 'Marriage'}
                  {currentUser.relationshipGoal === 'serious' && 'Serious Relationship'}
                  {currentUser.relationshipGoal === 'dating' && 'Dating'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{currentUser.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium text-gray-900">{currentUser.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <p className={`font-medium ${currentUser.isPremium ? 'text-purple-600' : 'text-gray-900'}`}>
                  {currentUser.isPremium ? 'Premium' : 'Free'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/app/profile')}
              variant="outline"
              className="mt-2"
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Premium/Token Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-500" />
                  Get More Messages
                </CardTitle>
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">
                You have <strong>{currentUser.tokens} tokens</strong> remaining. Each message costs 1 token.
              </p>

              {/* Premium Option */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="w-8 h-8" />
                  <div>
                    <h4 className="font-bold">Premium - Unlimited</h4>
                    <p className="text-sm text-purple-100">$9.99/month</p>
                  </div>
                </div>
                <ul className="text-sm space-y-1 mb-4 text-purple-100">
                  <li>Unlimited messages</li>
                  <li>Priority in discover</li>
                  <li>See who liked you</li>
                </ul>
                <Button
                  onClick={handleUpgradePremium}
                  className="w-full bg-white text-purple-600 hover:bg-purple-50"
                >
                  Upgrade to Premium
                </Button>
              </div>

              {/* Token Packages */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Or buy token packs:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleBuyTokens(10)}
                    className="p-3 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition text-center"
                  >
                    <Coins className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                    <p className="font-bold text-gray-900">10</p>
                    <p className="text-xs text-gray-500">$0.99</p>
                  </button>
                  <button
                    onClick={() => handleBuyTokens(50)}
                    className="p-3 border-2 border-amber-300 rounded-lg hover:bg-amber-50 transition text-center bg-amber-50"
                  >
                    <Coins className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                    <p className="font-bold text-gray-900">50</p>
                    <p className="text-xs text-gray-500">$3.99</p>
                  </button>
                  <button
                    onClick={() => handleBuyTokens(100)}
                    className="p-3 border-2 border-amber-200 rounded-lg hover:bg-amber-50 transition text-center"
                  >
                    <Coins className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                    <p className="font-bold text-gray-900">100</p>
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
