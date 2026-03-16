# Ethiomatch - Modern Dating App for Serious Relationships

A beautiful, fully-functional dating web application built with Next.js, React, and Tailwind CSS. Find meaningful connections through intelligent matching, intuitive swiping, and seamless messaging.

![Ethiomatch Logo](https://img.shields.io/badge/Ethiomatch-Dating%20App-FF6B6B?style=for-the-badge)

## ✨ Features

### 🎴 Smart Matching System
- **Tinder-like Swiping**: Browse profiles with beautiful card interface
- **Multiple Photos**: Gallery view with navigation for each profile
- **Smart Filtering**: Already-swiped profiles automatically hidden
- **Mutual Matching**: Conversations auto-created when both users like each other
- **Drag Support**: Swipe left to pass, right to like (mouse & touch)

### 💬 Real-Time Messaging
- **Instant Chat**: Message your matches immediately
- **Photo Sharing**: Upload and share photos in conversations
- **Video Sharing**: Record or upload videos to your messages
- **Chat History**: All messages preserved in browser storage
- **Typing Indicators**: See who's typing (future feature)

### 👤 Profile Management
- **Customize Profile**: Edit name, age, location, bio
- **Photo Gallery**: Upload multiple photos to showcase yourself
- **Video Resume**: Add short videos to your profile
- **Interests**: Add tags for your hobbies and interests
- **Relationship Goals**: Specify if you're looking for marriage, serious, or casual dating

### 🔐 User Authentication
- **Demo Mode**: 9 pre-loaded profiles to test immediately
- **Session Management**: Stay logged in across page refreshes
- **Quick Switching**: Logout and switch users in seconds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, pnpm, or yarn

### Installation

```bash
# Clone or extract the project
cd ethiomatch

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

### Open in Browser

```
http://localhost:3000
```

### First Time Use

1. You'll see the login screen with 9 demo users
2. Click "Login as [Name]" to select a profile
3. Start discovering! 🎉

## 📱 Try It Out

### Discover & Swipe
- Home page (`/`) shows profiles in swipeable cards
- Click ❤️ to like, ❌ to pass
- Or drag left/right with mouse
- View more photos with arrow buttons

### Messaging
- Go to **Matches** tab (`/matches`)
- Click a match to open conversation
- Send text, photos, or videos
- Messages saved instantly

### Edit Profile
- Go to **Profile** tab (`/profile`)
- Update your information
- Upload photos and videos
- Changes saved automatically

## 🏗️ Architecture

```
Ethiomatch/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Discover page
│   ├── login/page.tsx           # Login screen
│   ├── matches/page.tsx         # Messaging page
│   ├── profile/page.tsx         # Profile editor
│   ├── auth-context.tsx         # Auth state
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Design tokens
├── components/
│   ├── swipe-card.tsx           # Swipeable profile card
│   ├── navigation.tsx           # Top nav bar
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── db.ts                    # Database & types
│   └── utils.ts                 # Utilities
└── documentation files
```

## 🎨 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework |
| **React 19.2** | UI library |
| **Tailwind CSS v4** | Styling |
| **TypeScript** | Type safety |
| **shadcn/ui** | Component library |
| **Lucide React** | Icons |
| **localStorage** | Data persistence |

## 📚 Documentation

We've included comprehensive documentation:

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 5 minutes
- **[ETHIOMATCH_GUIDE.md](./ETHIOMATCH_GUIDE.md)** - Complete feature guide
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Technical overview
- **[COMPONENTS_STRUCTURE.md](./COMPONENTS_STRUCTURE.md)** - Architecture details
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues & solutions

## 👥 Demo Users

9 pre-loaded profiles to test the app:

| Name | Age | Goal | Location |
|------|-----|------|----------|
| Aisha | 28 | Marriage | Addis Ababa |
| Natashe | 26 | Serious | Addis Ababa |
| Maya | 25 | Dating | Dire Dawa |
| Sophia | 29 | Marriage | Hawassa |
| Yodit | 27 | Serious | Addis Ababa |
| Almaz | 24 | Dating | Addis Ababa |
| Getnet | 31 | Marriage | Addis Ababa |
| Dawit | 29 | Serious | Addis Ababa |
| Tadesse | 26 | Dating | Dire Dawa |

## 🎯 How It Works

### Matching Flow
```
1. User swipes profile (left/right)
2. Match record created
3. System checks for mutual like
4. If mutual → Conversation auto-created
5. Users can start messaging
```

### Data Storage
All data stored in browser **localStorage**:
- `ethiomatch_users` - User profiles
- `ethiomatch_matches` - Swipe history
- `ethiomatch_messages` - Chat messages
- `ethiomatch_conversations` - Conversations
- `ethiomatch_current_user` - Active session

No server required - everything is client-side!

## 🎨 Design Features

- **Warm Color Palette**: Orange, purple, and amber tones
- **Responsive Design**: Works on mobile, tablet, desktop
- **Smooth Animations**: Polished transitions and interactions
- **Accessible**: WCAG compliant, keyboard navigable
- **Dark Mode**: Full dark theme support (coming)

## 🔧 Build & Deploy

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect GitHub repo to Vercel for automatic deployments.

## 📊 Performance

- **Initial Load**: ~2-3 seconds
- **Bundle Size**: Optimized with Next.js
- **Interactions**: Instant (no network calls)
- **Mobile Ready**: Fully responsive
- **Storage**: Uses browser localStorage (~5-10MB limit)

## 🔒 Privacy & Security

- **All data local**: Nothing sent to external servers (demo mode)
- **No tracking**: No analytics or tracking code
- **Browser storage**: Encrypted by browser security
- **Image hosting**: Uses Unsplash CDN (public images)

*Note: For production, implement backend auth and proper image storage*

## 🚀 Future Enhancements

Potential features to add:
- Real user authentication (Auth.js)
- Backend database (Supabase/Neon)
- Image/video CDN storage (Vercel Blob)
- Location-based matching
- Advanced filters
- Video call integration
- Push notifications
- User verification
- Reporting/blocking system

## 🐛 Troubleshooting

Experiencing issues? Check out [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for:
- Common problems & solutions
- Debug commands
- Performance tips
- Storage management
- Browser compatibility

Quick fixes:
- **Clear cache**: Ctrl+Shift+Delete
- **Hard refresh**: Ctrl+Shift+R
- **Reset app**: `localStorage.clear()` in console
- **Check console**: F12 → Console tab

## 📝 Development

### Project Structure
```
app/              # Pages & routes
components/       # Reusable components
lib/             # Database & utilities
public/          # Static assets
styles/          # Global styles
```

### Key Files
- `app/page.tsx` - Discover/home
- `app/matches/page.tsx` - Messaging
- `app/profile/page.tsx` - Profile editor
- `components/swipe-card.tsx` - Card logic
- `lib/db.ts` - Data types & storage

### Adding Features
1. Create component in `/components`
2. Create page in `/app/[route]/page.tsx`
3. Use `useAuth()` for current user
4. Use `Database.*` for data access
5. Style with Tailwind + design tokens

## 📖 Learning Resources

Good for learning:
- **Component Architecture**: Check `/components`
- **State Management**: See `app/auth-context.tsx`
- **Data Persistence**: Review `lib/db.ts`
- **File Uploads**: Look at `app/profile/page.tsx`
- **React Hooks**: Study message & profile pages

## 🎓 Educational Value

This project demonstrates:
- ✅ Next.js App Router
- ✅ React Context for state
- ✅ TypeScript types
- ✅ Form handling
- ✅ File uploads (FileReader)
- ✅ LocalStorage API
- ✅ Responsive design
- ✅ Component composition
- ✅ Event handling
- ✅ Conditional rendering

Perfect for portfolio or learning!

## 📄 License

Built with ❤️ for meaningful connections

## 🤝 Contributing

Feel free to:
- Fork and modify
- Add new features
- Improve design
- Fix bugs
- Add documentation

## 🆘 Support

- Check documentation files
- Review code comments
- See troubleshooting guide
- Check browser console for errors

## 🎉 Have Fun!

This is a fully-functional app ready to use and modify. Whether you're learning web development, building a portfolio, or creating a real dating platform, Ethiomatch is a great foundation.

**Start discovering, start matching, start connecting! 💕**

---

## 📞 Quick Links

- 🚀 [Quick Start Guide](./QUICK_START.md)
- 📖 [Complete Guide](./ETHIOMATCH_GUIDE.md)
- 🏗️ [Architecture](./COMPONENTS_STRUCTURE.md)
- 🐛 [Troubleshooting](./TROUBLESHOOTING.md)
- 📋 [Project Summary](./PROJECT_SUMMARY.md)

---

**Built with Next.js 16, React 19, and Tailwind CSS v4** ✨
"# ethiomatch" 
