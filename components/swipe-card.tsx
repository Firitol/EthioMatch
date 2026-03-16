'use client';

import { User } from '@/lib/db';
import { Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';

interface SwipeCardProps {
  user: User;
  onLike: (userId: string) => void;
  onDislike: (userId: string) => void;
}

export function SwipeCard({ user, onLike, onDislike }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentPhoto = user.photos[currentPhotoIndex] || 'https://via.placeholder.com/400x600?text=No+Photo';

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex < user.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !cardRef.current) return;
    const diff = e.clientX - dragStart;
    cardRef.current.style.transform = `translateX(${diff * 0.2}px) rotate(${diff * 0.05}deg)`;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !cardRef.current) return;
    const diff = e.clientX - dragStart;
    cardRef.current.style.transform = 'translateX(0) rotate(0)';
    setIsDragging(false);
    setDragStart(null);

    if (Math.abs(diff) > 100) {
      if (diff > 0) {
        onDislike(user.id);
      } else {
        onLike(user.id);
      }
    }
  };

  const goalColors: Record<string, string> = {
    marriage: 'bg-pink-600',
    serious: 'bg-rose-600',
    dating: 'bg-amber-600',
  };

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isDragging) {
          handleMouseUp({ clientX: dragStart || 0 } as React.MouseEvent);
        }
      }}
      className="relative w-full max-w-sm mx-auto h-96 rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none transition-transform duration-300"
    >
      {/* Background Image */}
      <img src={currentPhoto} alt={user.name} className="w-full h-full object-cover" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Photo Navigation */}
      {user.photos.length > 1 && (
        <>
          <button
            onClick={handlePrevPhoto}
            disabled={currentPhotoIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/30 hover:bg-white/50 rounded-full transition disabled:opacity-30 z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handleNextPhoto}
            disabled={currentPhotoIndex === user.photos.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/30 hover:bg-white/50 rounded-full transition disabled:opacity-30 z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Photo Indicators */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {user.photos.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition ${
                  idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-baseline gap-2 mb-2">
          <h2 className="text-3xl font-bold">{user.name}</h2>
          <span className="text-xl text-white/90">{user.age}</span>
        </div>
        <p className="text-sm text-white/80 mb-2">{user.location}</p>
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`${goalColors[user.relationshipGoal]} text-white text-xs px-3 py-1 rounded-full font-medium`}
          >
            {user.relationshipGoal === 'marriage' && 'Looking for Marriage'}
            {user.relationshipGoal === 'serious' && 'Serious Relationship'}
            {user.relationshipGoal === 'dating' && 'Dating'}
          </span>
        </div>
        <p className="text-sm text-white/70 line-clamp-2 mb-3">{user.bio}</p>

        {/* Interests Preview */}
        <div className="flex flex-wrap gap-2">
          {user.interests.slice(0, 3).map((interest) => (
            <span key={interest} className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDislike(user.id);
          }}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(user.id);
          }}
          className="p-3 bg-primary/90 hover:bg-primary rounded-full transition backdrop-blur"
        >
          <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
        </button>
      </div>
    </div>
  );
}
