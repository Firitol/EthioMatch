'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth-context';
import { useRouter } from 'next/navigation';
import { User, Database } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Upload, Trash2, Play } from 'lucide-react';
import { ProfileView } from '@/components/profile-view';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setFormData(currentUser);
  }, [currentUser, router]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !formData) return;

    setUploadingPhoto(true);
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            photos: [...prev.photos, dataUrl],
          };
        });
      };
      reader.readAsDataURL(file);
    });
    setUploadingPhoto(false);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !formData) return;

    setUploadingVideo(true);
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            videos: [...prev.videos, dataUrl],
          };
        });
      };
      reader.readAsDataURL(file);
    });
    setUploadingVideo(false);
  };

  const removePhoto = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    });
  };

  const removeVideo = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      videos: formData.videos.filter((_, i) => i !== index),
    });
  };

  const handleSaveProfile = () => {
    if (!formData) return;
    updateProfile(formData);
    setIsEditing(false);
  };

  if (!currentUser || !formData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Preview */}
          <div className="lg:col-span-2">
            <ProfileView user={formData} showActions={false} />
          </div>

          {/* Edit Panel */}
          <div className="lg:col-span-1">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bio Edit */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Bio</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell about yourself"
                      className="resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Interests Edit */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                      Interests (comma-separated)
                    </label>
                    <Input
                      value={formData.interests.join(', ')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          interests: e.target.value.split(',').map((i) => i.trim()),
                        })
                      }
                      placeholder="e.g., Travel, Coffee, Sports"
                    />
                  </div>

                  {/* Location Edit */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="City"
                    />
                  </div>

                  {/* Save Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      Save Profile
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(currentUser);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Age</p>
                    <p className="font-semibold text-gray-900">{formData.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{formData.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Looking For</p>
                    <p className="font-semibold text-red-600">
                      {formData.relationshipGoal === 'marriage' && '💍 Marriage'}
                      {formData.relationshipGoal === 'serious' && '❤️ Serious'}
                      {formData.relationshipGoal === 'dating' && '💕 Dating'}
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Media Upload Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Media Gallery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photos */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-3">
                      Photos ({formData.photos.length})
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {formData.photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden group"
                        >
                          <img
                            src={photo}
                            alt={`Photo ${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removePhoto(idx)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="block">
                      <Button
                        asChild
                        className="w-full bg-red-100 hover:bg-red-200 text-red-700"
                        disabled={uploadingPhoto}
                      >
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingPhoto ? 'Uploading...' : 'Add Photos'}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                </div>

                {/* Videos */}
                <div className="space-y-3 border-t border-gray-200 pt-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-3">
                      Videos ({formData.videos.length})
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {formData.videos.map((video, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden group flex items-center justify-center"
                        >
                          <Play className="w-8 h-8 text-white absolute" />
                          <video
                            src={video}
                            className="w-full h-full object-cover opacity-50"
                          />
                          <button
                            onClick={() => removeVideo(idx)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="block">
                      <Button
                        asChild
                        className="w-full bg-red-100 hover:bg-red-200 text-red-700"
                        disabled={uploadingVideo}
                      >
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingVideo ? 'Uploading...' : 'Add Videos'}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoUpload}
                        className="hidden"
                        disabled={uploadingVideo}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
