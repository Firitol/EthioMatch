# Ethiomatch - Dating App for Serious Relationships

## Overview

Ethiomatch is a modern web-based dating application designed for individuals seeking serious, meaningful relationships. Built with Next.js, React, and TypeScript, it provides a Tinder-like matching experience with messaging and profile management features.

## Features

### 1. **Discover & Swiping**
- Browse potential matches with beautiful card-based interface
- View multiple photos per profile with navigation
- See relationship goals and interests at a glance
- Swipe left (dislike) or right (like) on profiles
- Drag-and-drop swiping support

### 2. **Matching System**
- Automatic mutual match detection
- Conversations created when both users like each other
- Track all your matches in one place

### 3. **Messaging**
- Real-time chat interface
- Send text messages
- Share photos and videos in conversations
- File upload with preview
- Message timestamps
- Read status tracking

### 4. **Profile Management**
- Edit your profile information (name, age, location, bio)
- Select relationship goal (Marriage, Serious Relationship, Dating)
- Add interests and hobbies
- Upload up to 6 photos
- Upload videos to showcase yourself
- All changes saved locally

## Getting Started

### Login
1. Open the app at `http://localhost:3000`
2. Select a profile from the available demo users
3. Click "Login as [Name]" to start using the app

**Demo Users Available:**
- Aisha - 28, Looking for Marriage
- Natashe - 26, Serious Relationship
- Maya - 25, Dating
- Sophia - 29, Looking for Marriage
- Yodit - 27, Serious Relationship
- Almaz - 24, Dating
- Getnet - 31, Looking for Marriage
- Dawit - 29, Serious Relationship
- Tadesse - 26, Dating

### Navigation

**Top Navigation Bar:**
- **Discover** (Heart Icon) - Swipe through profiles
- **Matches** (Message Icon) - View conversations and chat
- **Profile** (User Icon) - Edit your profile
- **Logout** - Return to login screen

## How to Use

### Discovering Profiles

1. Click the "Discover" tab or navigate to home page
2. View profile cards with photos, name, age, location, and bio
3. Use arrow buttons to browse multiple photos
4. Click the ❌ button or drag left to pass
5. Click the ❤️ button or drag right to like
6. Continue swiping until you find someone interesting

**Profile Information Shown:**
- Name and age
- Location
- Relationship goal (Marriage/Serious/Dating)
- Bio (short description)
- Interests (up to 3 shown)
- Multiple photos (if available)

### Matches & Messaging

1. Navigate to the **Matches** tab
2. Select a conversation from the left sidebar
3. View chat history in the center
4. Send messages in the input field
5. Share media files (photos/videos) by clicking the attachment icon
6. Press Enter or click Send to submit

**Messaging Features:**
- Text messages
- Photo uploads
- Video uploads
- Message timestamps
- Message history

### Managing Your Profile

1. Click the **Profile** tab
2. Edit your information:
   - **Name** - Your display name
   - **Age** - Your age
   - **Location** - City/region
   - **Bio** - About yourself (max 500 chars)
   - **Looking For** - Relationship goal
   - **Interests** - Comma-separated list (e.g., "Travel, Reading, Cooking")
3. Upload photos by clicking "Add Photo"
4. Upload videos by clicking "Add Video"
5. Click "Save Profile" to save changes

## Technical Details

### Architecture

- **Frontend:** Next.js 16 with React 19
- **Styling:** Tailwind CSS v4
- **State Management:** React Context + localStorage
- **Database:** Browser localStorage (mock database)
- **UI Components:** shadcn/ui

### Data Storage

All data is stored in browser localStorage under these keys:
- `ethiomatch_users` - User profiles
- `ethiomatch_matches` - Like/dislike history
- `ethiomatch_messages` - All messages
- `ethiomatch_conversations` - Chat conversations
- `ethiomatch_current_user` - Currently logged-in user

### File Upload

Photos and videos are converted to base64 data URLs and stored in localStorage. This allows for instant playback and sharing without a backend.

## Design Features

### Color Scheme
- **Primary:** Warm coral/warm-orange tone (#C85A3A)
- **Secondary:** Soft purple (#A088B5)
- **Accent:** Golden-amber
- **Neutrals:** Clean whites, grays, blacks

### Typography
- **Font:** Geist (modern, clean)
- **Responsive:** Adapts to mobile, tablet, and desktop

### User Experience
- Smooth transitions and animations
- Mobile-first responsive design
- Intuitive drag-and-drop swiping
- Real-time photo/video upload feedback

## Browser Compatibility

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Demo Mode

The app runs in demo mode with pre-populated users. You can:
- Switch users by logging out and selecting another profile
- Create new swipes and matches
- Send messages between profiles
- Upload photos and videos
- Edit profiles
- All data is saved locally to your browser

## Future Enhancements

Potential features for future development:
- Real backend database (Supabase/Neon)
- User authentication with proper signup/login
- Photo moderation
- Report/block user functionality
- Video call integration
- Advanced search filters
- User verification
- Read receipts
- Typing indicators
- Push notifications

## Support

For issues or questions about the app, refer to the code comments or check the component files in `/components` and `/app`.

---

**Created with ❤️ for meaningful connections**
