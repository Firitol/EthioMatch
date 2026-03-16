# Ethiomatch - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   USER BROWSER                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         NEXT.JS APPLICATION (PORT 3000)          │  │
│  │                                                   │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │      React Components & Pages              │  │  │
│  │  │  - Navigation, SwipeCard, Forms, etc.      │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │           │                                       │  │
│  │           ↓                                       │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │      React Context (Auth)                  │  │  │
│  │  │  - currentUser, login, logout, etc.        │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │           │                                       │  │
│  │           ↓                                       │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │      Database Layer (lib/db.ts)            │  │  │
│  │  │  - Types: User, Match, Message, etc.       │  │  │
│  │  │  - Methods: getUsers(), saveMessages(), etc.│ │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │           │                                       │  │
│  │           ↓                                       │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │      Browser localStorage                  │  │  │
│  │  │  - ethiomatch_users                        │  │  │
│  │  │  - ethiomatch_matches                      │  │  │
│  │  │  - ethiomatch_messages                     │  │  │
│  │  │  - ethiomatch_conversations                │  │  │
│  │  │  - ethiomatch_current_user                 │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 📚 Layer Breakdown

### Layer 1: UI/Components
```
┌─────────────────────────────────────┐
│      UI Layer (React)               │
├─────────────────────────────────────┤
│ • Navigation.tsx                    │
│ • SwipeCard.tsx                     │
│ • Page components (page.tsx)        │
│ • shadcn/ui components              │
│ • Theme provider                    │
└─────────────────────────────────────┘
```

### Layer 2: State Management
```
┌─────────────────────────────────────┐
│    State Management                 │
├─────────────────────────────────────┤
│ • AuthContext                       │
│   - currentUser                     │
│   - isLoading                       │
│   - login(), logout(), etc.         │
│                                     │
│ • Component State (useState)        │
│   - Forms, inputs, selections       │
│   - UI state (isOpen, etc.)        │
└─────────────────────────────────────┘
```

### Layer 3: Data Management
```
┌─────────────────────────────────────┐
│    Database Layer (lib/db.ts)       │
├─────────────────────────────────────┤
│ • Type Definitions:                 │
│   - User, Match, Message            │
│   - Conversation                    │
│                                     │
│ • Database Methods:                 │
│   - getUsers()                      │
│   - saveMatches()                   │
│   - getMessages()                   │
│   - getConversations()              │
│   - getCurrentUser()                │
└─────────────────────────────────────┘
```

### Layer 4: Storage
```
┌─────────────────────────────────────┐
│    Browser localStorage             │
├─────────────────────────────────────┤
│ • Persistent client-side storage    │
│ • ~5-10MB capacity                  │
│ • Survives page reload              │
│ • Clear with F12 → Storage          │
└─────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### Unidirectional Data Flow

```
User Interaction
        ↓
Event Handler
        ↓
Update State
        ↓
Re-render Component
        ↓
User Sees Changes
```

### Example: Liking a Profile

```
User clicks ❤️ button
        ↓
onLike(userId) called in SwipeCard
        ↓
handleLike() in app/page.tsx
        ↓
Create Match object
        ↓
Database.saveMatches(updatedMatches)
        ↓
Save to localStorage
        ↓
Check for mutual match
        ↓
If mutual → Create conversation
        ↓
Update state (setCurrentIndex++)
        ↓
Component re-renders
        ↓
Next card displayed
```

## 🗂️ Directory Structure

```
ethiomatch/
│
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Discover/Home
│   ├── globals.css              # Global styles
│   ├── auth-context.tsx         # Auth state
│   │
│   ├── login/
│   │   └── page.tsx             # Login page
│   │
│   ├── matches/
│   │   └── page.tsx             # Messaging page
│   │
│   └── profile/
│       └── page.tsx             # Profile editor
│
├── components/                   # React components
│   ├── navigation.tsx           # Top nav
│   ├── swipe-card.tsx           # Profile card
│   ├── theme-provider.tsx       # Dark mode
│   │
│   └── ui/                      # shadcn/ui
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ... (45+ more)
│
├── lib/                          # Utilities
│   ├── db.ts                    # Database
│   └── utils.ts                 # Helpers
│
├── public/                       # Static assets
├── styles/                       # Additional styles
│
└── [Config files]
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs
    └── tailwind.config.js
```

## 🔐 Authentication Flow

```
┌──────────────────┐
│   Login Page     │
│   (/login)       │
└────────┬─────────┘
         │
    User clicks "Login"
         │
         ↓
┌──────────────────────────────────┐
│   handleLogin(userId)            │
│   - Find user from Database      │
│   - Call useAuth().login()       │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│   AuthContext.login()            │
│   - Find user by ID              │
│   - Call setCurrentUser()        │
│   - Update state                 │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│   localStorage.setItem()         │
│   - Save currentUser to storage  │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────┐
│   Navigate to /  │
│   Discover Page  │
└──────────────────┘
```

## 💬 Messaging Architecture

```
┌─────────────────────────────────┐
│     Chat Interface (/matches)   │
├─────────────────────────────────┤
│                                 │
│ ┌──────────────────────────┐   │
│ │  Conversation List       │   │
│ │  - Click to select       │   │
│ └──────────────────────────┘   │
│                                 │
│ ┌──────────────────────────┐   │
│ │  Message Display         │   │
│ │  - My messages (right)   │   │
│ │  - Their messages (left) │   │
│ └──────────────────────────┘   │
│                                 │
│ ┌──────────────────────────┐   │
│ │  Message Input           │   │
│ │  - Text input            │   │
│ │  - File upload           │   │
│ │  - Send button           │   │
│ └──────────────────────────┘   │
└─────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│   Create Message Object         │
│   - conversationId              │
│   - senderId                    │
│   - receiverId                  │
│   - content                     │
│   - mediaUrl (optional)         │
│   - createdAt                   │
└─────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│   Database.saveMessages()       │
│   - Add to messages array       │
│   - Save to localStorage        │
└─────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│   Component Re-render           │
│   - Display new message         │
│   - Show media if included      │
│   - Scroll to latest message    │
└─────────────────────────────────┘
```

## 🎴 Swiping Architecture

```
┌────────────────┐
│  Profile Card  │
│  (SwipeCard)   │
└────────┬───────┘
         │
    User Interaction
    (click or drag)
         │
    ┌────┴─────────────────┐
    ↓                      ↓
  Like                   Dislike
    │                      │
    └────────┬─────────────┘
             │
    Create Match Record
             │
       ┌──────┴──────────┐
       ↓                 ↓
   Check Reverse    Save to
   Match Found      localStorage
       │                │
    ┌──┴──┐         ────┘
    ↓     ↓
  YES    NO
    │     │
    │     └─ Continue showing
    │        new profiles
    │
    └─ Create Conversation
       + Add both to participants
       + Save to localStorage
       + Appear in Matches page
```

## 📱 Component Hierarchy

```
App (with providers)
│
├── AuthProvider
│   └── ThemeProvider
│       ├── RootLayout
│       │
│       ├── /login
│       │   └── Login Page
│       │       └── User Selection Cards
│       │
│       ├── / (Discover)
│       │   ├── Navigation
│       │   └── Main Content
│       │       └── SwipeCard
│       │           ├── Photo Gallery
│       │           ├── User Info
│       │           └── Action Buttons
│       │
│       ├── /matches
│       │   ├── Navigation
│       │   └── Main Content
│       │       ├── Conversation List
│       │       └── Chat Area
│       │           ├── Messages Display
│       │           └── Message Input
│       │               └── File Upload
│       │
│       └── /profile
│           ├── Navigation
│           └── Main Content
│               ├── Form Inputs
│               ├── Photo Gallery
│               ├── Video List
│               └── Save Button
```

## 🗄️ Data Model

```
User
├── id: string
├── name: string
├── age: number
├── gender: 'male' | 'female'
├── relationshipGoal: 'marriage' | 'serious' | 'dating'
├── bio: string
├── photos: string[] (base64)
├── videos: string[] (base64)
├── interests: string[]
├── location: string
└── createdAt: number

Match
├── id: string
├── userId: string
├── matchedUserId: string
├── status: 'liked' | 'disliked' | 'matched'
└── createdAt: number

Conversation
├── id: string
├── participants: [string, string]
├── lastMessage?: string
├── lastMessageTime?: number
└── createdAt: number

Message
├── id: string
├── conversationId: string
├── senderId: string
├── receiverId: string
├── content: string
├── mediaUrl?: string (base64)
├── mediaType?: 'image' | 'video'
├── createdAt: number
└── read: boolean
```

## 🔄 State Management Pattern

```
Component
    │
    ├─ Local State (useState)
    │   └─ Form inputs, UI state
    │
    ├─ Auth Context (useAuth)
    │   └─ currentUser, login, logout
    │
    └─ Database Calls
        └─ Database.getUsers(), etc.
            │
            ↓
        localStorage
            │
            ↓
        Persist & Retrieve Data
```

## 🚀 Deployment Architecture

### Development
```
npm run dev
    ↓
Next.js Dev Server (Port 3000)
    ↓
Hot Module Reload (HMR)
    ↓
File Changes → Instant Reload
```

### Production
```
npm run build
    ↓
Build Optimization
    ↓
Static Generation
    ↓
npm start
    ↓
Next.js Server (Port 3000)
```

### Vercel Deployment
```
Push to GitHub
    ↓
Vercel Auto-Deploy
    ↓
Build & Optimize
    ↓
Live URL
```

## 🔗 External Integrations

Currently none - all client-side! But ready for:

```
Future: Can Add
├── Auth.js (Authentication)
├── Supabase (Database)
├── Vercel Blob (File Storage)
├── Stripe (Payments)
└── SendGrid (Email)
```

## 📊 Performance Optimization

```
Next.js Optimizations
├── Code Splitting
├── Image Optimization
├── CSS Minification
├── JavaScript Minification
└── Lazy Loading

React Optimizations
├── Memoization
├── useCallback
├── useMemo
└── Component Splitting

Tailwind Optimizations
├── PurgeCSS
├── JIT Compilation
└── Tree Shaking
```

## 🔒 Security Considerations

```
✅ Implemented
├── Type Safety (TypeScript)
├── Input Validation
├── XSS Protection (React)
└── CSRF Safe (GET only)

⚠️ Todo (For Production)
├── User Authentication
├── Password Hashing
├── HTTPS
├── Rate Limiting
├── CORS Policy
└── Content Security Policy
```

## 📈 Scalability Plan

### Phase 1: Current (Local Demo)
- Client-side only
- localStorage persistence
- 9 demo users

### Phase 2: Backend Integration
- Real database (Supabase/Neon)
- User authentication
- API endpoints

### Phase 3: Advanced
- Location-based matching
- Advanced search
- Video calling
- Push notifications

## 🏗️ File Organization Philosophy

```
Functional Organization:
├── Pages (routes) → app/
├── Components (reusable UI) → components/
├── Utilities (helpers) → lib/
└── Styles (theme) → globals.css

Benefits:
✅ Easy to navigate
✅ Scalable structure
✅ Clear responsibilities
✅ Easy to test
```

---

This architecture is designed for **clarity, scalability, and ease of modification**. Each layer has a specific responsibility, making it easy to understand and extend the application.
