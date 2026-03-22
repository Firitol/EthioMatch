'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth-context';
import { useRouter } from 'next/navigation';
import { Database, User, Match } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, X } from 'lucide-react';

export default function DiscoverPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [candidates, setCandidates] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        // Load candidates (all users except current user)
        const usersResponse = await fetch('/api/users?action=all');
        if (usersResponse.ok) {
          const allUsers = await usersResponse.json();
          const filteredCandidates = allUsers.filter((u: User) => u.id !== currentUser.id);
          setCandidates(filteredCandidates);
        } else {
          // Fallback to Database for now
          const allUsers = Database.getUsers();
          const filteredCandidates = allUsers.filter((u) => u.id !== currentUser.id);
          setCandidates(filteredCandidates);
        }

        // Load matches
        const matchesResponse = await fetch(`/api/matches?userId=${currentUser.id}`);
        if (matchesResponse.ok) {
          const userMatches = await matchesResponse.json();
          setMatches(userMatches);
        } else {
          // Fallback to Database
          const allMatches = Database.getMatches();
          const userMatches = allMatches.filter(
            (m) => m.userId === currentUser.id || m.matchedUserId === currentUser.id
          );
          setMatches(userMatches);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to Database
        const allUsers = Database.getUsers();
        const filteredCandidates = allUsers.filter((u) => u.id !== currentUser.id);
        setCandidates(filteredCandidates);

        const allMatches = Database.getMatches();
        const userMatches = allMatches.filter(
          (m) => m.userId === currentUser.id || m.matchedUserId === currentUser.id
        );
        setMatches(userMatches);
      }
    };

    loadData();
  }, [currentUser, router]);

  const handleLike = async () => {
    if (!candidates[currentIndex]) return;

    const targetUserId = candidates[currentIndex].id;

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser!.id,
          matchedUserId: targetUserId,
          status: 'liked',
        }),
      });

      if (response.ok) {
        const newMatch = await response.json();
        setMatches([...matches, newMatch]);
        setLikeCount(likeCount + 1);
      }
    } catch (error) {
      console.error('Failed to like:', error);
      // Fallback to Database
      const newMatch: Match = {
        id: `match-${currentUser!.id}-${targetUserId}-${Date.now()}`,
        userId: currentUser!.id,
        matchedUserId: targetUserId,
        status: 'liked',
        createdAt: Date.now(),
      };

      const allMatches = Database.getMatches();
      allMatches.push(newMatch);
      Database.saveMatches(allMatches);
      setMatches(allMatches);
      setLikeCount(likeCount + 1);
    }

    nextCard();
  };

  const handleDislike = async () => {
    if (!candidates[currentIndex]) return;

    const targetUserId = candidates[currentIndex].id;

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser!.id,
          matchedUserId: targetUserId,
          status: 'disliked',
        }),
      });

      if (response.ok) {
        const newMatch = await response.json();
        setMatches([...matches, newMatch]);
        setDislikeCount(dislikeCount + 1);
      }
    } catch (error) {
      console.error('Failed to dislike:', error);
      // Fallback to Database
      const newMatch: Match = {
        id: `match-${currentUser!.id}-${targetUserId}-${Date.now()}`,
        userId: currentUser!.id,
        matchedUserId: targetUserId,
        status: 'disliked',
        createdAt: Date.now(),
      };

      const allMatches = Database.getMatches();
      allMatches.push(newMatch);
      Database.saveMatches(allMatches);
      setMatches(allMatches);
      setDislikeCount(dislikeCount + 1);
    }

    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCandidates([]);
    }
  };

  if (!currentUser) {
    return null;
  }

  const currentProfile = candidates[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
      {/* Main Content */}
      <div className="w-full md:max-w-6xl md:mx-auto px-0 md:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-8">
          {/* Swipe Area */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center px-3 md:px-0">
            <div className="mb-4 md:mb-8 text-center">
              <h2 className="text-xl md:text-3xl font-bold text-gray-900">Discover Matches</h2>
              <p className="text-xs md:text-base text-gray-600 mt-1 md:mt-2">Swipe to find people looking for serious relationships</p>
            </div>

            {candidates.length > 0 && currentIndex < candidates.length ? (
              <div className="w-full max-w-md">
                {/* Profile Card */}
                <Card className="bg-white border-0 shadow-2xl overflow-hidden md:rounded-lg rounded-t-2xl">
                  {/* Photo Section */}
                  <div className="relative bg-gradient-to-b from-gray-200 to-gray-100 h-72 md:h-96 flex items-center justify-center overflow-hidden">
                    {currentProfile.photos && currentProfile.photos.length > 0 ? (
                      <img
                        src={currentProfile.photos[0]}
                        alt={currentProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Heart className="w-12 md:w-16 h-12 md:h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm md:text-base text-gray-500">No photo available</p>
                      </div>
                    )}
                    {/* Age Badge */}
                    <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-white rounded-full px-3 md:px-4 py-1 md:py-2 shadow-lg">
                      <p className="font-bold text-gray-900 text-sm md:text-base">{currentProfile.age}</p>
                    </div>
                    {/* Relationship Goal Badge */}
                    <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 bg-red-500 text-white rounded-full px-3 md:px-4 py-1 md:py-2 shadow-lg font-semibold text-xs md:text-sm">
                      {currentProfile.relationshipGoal === 'marriage' && '💍 Marriage'}
                      {currentProfile.relationshipGoal === 'serious' && '❤️ Serious'}
                      {currentProfile.relationshipGoal === 'dating' && '💕 Dating'}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4 max-h-64 md:max-h-96 overflow-y-auto">
                    <div className="break-words">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 break-words">{currentProfile.name}</h2>
                      <p className="text-sm md:text-base text-gray-600 break-words">{currentProfile.location}</p>
                    </div>

                    <p className="text-gray-700 text-xs md:text-sm leading-relaxed break-words">{currentProfile.bio}</p>

                    {/* Interests */}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-xs md:text-sm mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentProfile.interests.map((interest) => (
                          <span
                            key={interest}
                            className="px-2 md:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Videos Section */}
                    {currentProfile.videos && currentProfile.videos.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 text-xs md:text-sm mb-2">Videos</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {currentProfile.videos.slice(0, 2).map((video, idx) => (
                            <div key={idx} className="bg-gray-100 rounded h-20 md:h-24">
                              <video
                                src={video}
                                controls
                                className="w-full h-full rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-3 md:pt-4">
                      <Button
                        onClick={handleDislike}
                        variant="outline"
                        className="flex-1 py-5 md:py-6 border-2 border-gray-300 hover:border-gray-400"
                      >
                        <X className="w-5 md:w-6 h-5 md:h-6" />
                      </Button>
                      <Button
                        onClick={handleLike}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-5 md:py-6"
                      >
                        <Heart className="w-5 md:w-6 h-5 md:h-6 fill-white" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress */}
                <div className="mt-4 md:mt-6 text-center">
                  <p className="text-xs md:text-sm text-gray-600 mb-2">
                    {currentIndex + 1} of {candidates.length}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / candidates.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="w-full max-w-sm mx-auto">
                <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 text-center">
                  <div className="text-4xl md:text-5xl mb-3 md:mb-4">🎉</div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">No more profiles</h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-4">
                    You've reviewed all available profiles. Check back later for new matches!
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm"
                  >
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Action Stats */}
            <div className="mt-6 md:mt-8 flex gap-6 md:gap-8 text-center">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Likes</p>
                <p className="text-2xl md:text-3xl font-bold text-red-500">{likeCount}</p>
              </div>
              <div className="w-px bg-gray-300" />
              <div>
                <p className="text-xs md:text-sm text-gray-600">Passes</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-500">{dislikeCount}</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Matches & Stats */}
          <aside className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h3 className="font-bold text-base md:text-lg text-gray-900">Your Stats</h3>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-2">Available Profiles</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{candidates.length}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-2">Your Likes</p>
                  <p className="text-2xl md:text-3xl font-bold text-red-500">{likeCount}</p>
                </div>

                {/* Current User Info */}
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                  <p className="text-xs md:text-sm font-semibold text-gray-900 mb-3">Your Profile</p>
                  <div className="text-xs md:text-sm text-gray-700 space-y-2">
                    <p className="font-medium">{currentUser.name}, {currentUser.age}</p>
                    <p className="text-gray-600">{currentUser.location}</p>
                    {currentUser.relationshipGoal === 'marriage' && (
                      <p className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded inline-block">💍 Looking for Marriage</p>
                    )}
                    {currentUser.relationshipGoal === 'serious' && (
                      <p className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded inline-block">❤️ Serious Relationship</p>
                    )}
                    {currentUser.relationshipGoal === 'dating' && (
                      <p className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded inline-block">💕 Dating</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
