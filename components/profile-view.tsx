'use client';

import { User } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { Image, Play, MapPin, Cake } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onEdit?: () => void;
  showActions?: boolean;
}

export function ProfileView({ user, onEdit, showActions = true }: ProfileViewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="pb-4 bg-gradient-to-r from-red-50 to-rose-50">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">
                {user.name}, {user.age}
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Photos & Videos */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Media Gallery
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {user.photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
                  onClick={() => setSelectedImage(photo)}
                >
                  <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {user.videos.map((video, idx) => (
                <div
                  key={`video-${idx}`}
                  className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center"
                >
                  <Play className="w-8 h-8 text-white" />
                  <video src={video} className="w-full h-full object-cover opacity-50" />
                </div>
              ))}
              {user.photos.length === 0 && user.videos.length === 0 && (
                <div className="col-span-2 md:col-span-3 py-8 text-center text-gray-500">
                  No photos or videos yet
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">About</h3>
            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Relationship Goal */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Looking For</h3>
            <div className="inline-block">
              <span className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg font-medium">
                {user.relationshipGoal === 'marriage' && '💍 Serious - Marriage'}
                {user.relationshipGoal === 'serious' && '❤️ Serious Relationship'}
                {user.relationshipGoal === 'dating' && '💕 Dating'}
              </span>
            </div>
          </div>

          {/* Actions */}
          {showActions && onEdit && (
            <Button
              onClick={onEdit}
              className="w-full bg-red-500 hover:bg-red-600 text-white mt-4"
            >
              Edit Profile
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Photo</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img src={selectedImage} alt="Full size" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
