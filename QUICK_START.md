# Ethiomatch - Quick Start Guide

## Installation & Running

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

### 3. Open in Browser
Navigate to `http://localhost:3000`

## First Time Setup

1. **Login Screen** - You'll see 9 demo users available
2. **Select a User** - Click "Login as [Name]" to choose a profile
3. **Start Discovering** - You're now in the app!

## App Flow

### Home / Discover Page (`/`)
- See profile cards with photos
- Click ❤️ (Heart) or drag right to **Like**
- Click ❌ or drag left to **Pass**
- Navigate photos with arrow buttons
- When mutual match occurs, a conversation is created

### Matches & Messages (`/matches`)
- See all your mutual matches
- Click a match to open conversation
- Send text messages
- Attach photos or videos
- Messages saved automatically

### Profile Settings (`/profile`)
- Edit name, age, location, bio
- Choose relationship goal
- Add interests (comma-separated)
- Upload photos (click "Add Photo")
- Upload videos (click "Add Video")
- Click "Save Profile" to save

### Navigation
- **Heart Icon** - Go to Discover
- **Message Icon** - Go to Matches
- **User Icon** - Go to Profile
- **Logout** - Return to login

## Demo Users

The app comes with 9 pre-loaded profiles:

**Women:**
- Aisha, 28 - Looking for Marriage
- Natashe, 26 - Serious Relationship
- Maya, 25 - Dating
- Sophia, 29 - Looking for Marriage
- Yodit, 27 - Serious Relationship
- Almaz, 24 - Dating

**Men:**
- Getnet, 31 - Looking for Marriage
- Dawit, 29 - Serious Relationship
- Tadesse, 26 - Dating

## Features

✅ **Discover & Swipe** - Browse profiles, like or pass
✅ **Matching** - Automatic detection of mutual likes
✅ **Messaging** - Chat with your matches
✅ **File Sharing** - Send photos and videos
✅ **Profile Management** - Edit your profile
✅ **Data Persistence** - All data saved in browser

## Troubleshooting

### "No more profiles" message
- You've swiped through all available profiles
- Log out and log in as a different user to see more
- Or wait for app reset

### Messages not showing
- Ensure both users have liked each other
- Conversation is created automatically on mutual like
- Check the Matches page

### Photos not uploading
- Make sure file is image format (jpg, png, gif, etc.)
- Maximum size should be reasonable (tested up to 5MB)
- Video should be valid video format (mp4, webm, etc.)

### Profile not saving
- Click the "Save Profile" button
- Data is stored in browser localStorage
- It will persist across page refreshes

## Key Pages

| Page | Path | Purpose |
|------|------|---------|
| Discover | `/` | Browse and swipe profiles |
| Matches | `/matches` | View matches and chat |
| Profile | `/profile` | Edit your profile |
| Login | `/login` | Select a user to log in |

## Data Storage

All data is stored in your browser's localStorage:
- Clear browser cache to reset the app
- Data is NOT sent to any server
- Everything is local to your machine

## Switching Users

1. Click **Logout** in top right
2. Select a different user from the login page
3. Start fresh with that user's profile

## Need Help?

- Check `ETHIOMATCH_GUIDE.md` for detailed documentation
- Review component code in `/components`
- Check page implementations in `/app`
- Look at database logic in `/lib/db.ts`

---

**Built with ❤️ using Next.js, React, and Tailwind CSS**
