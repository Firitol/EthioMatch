# Ethiomatch - Component Structure

## Project Architecture

```
ethiomatch/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Discover/Home page
│   ├── globals.css              # Global styles & design tokens
│   ├── auth-context.tsx         # Auth state management
│   ├── login/
│   │   └── page.tsx             # Login screen
│   ├── matches/
│   │   └── page.tsx             # Matches & messaging page
│   └── profile/
│       └── page.tsx             # Profile editing page
├── components/
│   ├── navigation.tsx           # Top navigation bar
│   ├── swipe-card.tsx           # Profile card with swipe
│   ├── theme-provider.tsx       # Dark mode provider
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── card.tsx
│       ├── tabs.tsx
│       ├── select.tsx
│       └── ... (other UI components)
├── lib/
│   ├── db.ts                    # Database & data types
│   └── utils.ts                 # Utility functions
├── ETHIOMATCH_GUIDE.md          # Full documentation
├── QUICK_START.md               # Setup instructions
└── package.json                 # Dependencies
```

## Key Components

### 1. **Navigation** (`components/navigation.tsx`)
Top navigation bar with links to:
- Discover (Home)
- Matches (Messaging)
- Profile (Settings)
- Logout button

```tsx
<Navigation />
```

**Props:** None
**State:** Uses `usePathname()` from Next.js routing

### 2. **SwipeCard** (`components/swipe-card.tsx`)
Individual profile card with:
- Photo gallery with navigation
- User info overlay
- Like/Dislike buttons
- Drag-to-swipe functionality

```tsx
<SwipeCard
  user={user}
  onLike={(userId) => handleLike(userId)}
  onDislike={(userId) => handleDislike(userId)}
/>
```

**Props:**
- `user: User` - User object to display
- `onLike: (userId: string) => void` - Like callback
- `onDislike: (userId: string) => void` - Dislike callback

**Features:**
- Photo carousel
- Drag support (left = dislike, right = like)
- Photo indicators
- Smooth animations

### 3. **ThemeProvider** (`components/theme-provider.tsx`)
Wraps the app with next-themes for dark mode support.

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

## Pages

### Discover Page (`app/page.tsx`)
**Route:** `/`

Main swiping interface:
- Shows SwipeCard component
- Manages match logic
- Filters already-liked profiles
- Creates conversations on mutual match
- "No more profiles" screen

**State:**
- `users[]` - Available profiles
- `currentIndex` - Current card index
- `matches[]` - User's matches

### Login Page (`app/login/page.tsx`)
**Route:** `/login`

User selection screen:
- Shows all available demo users
- Click to log in as that user
- Displays user preview cards

**Features:**
- User cards with bio preview
- Interests display
- Quick login buttons

### Matches Page (`app/matches/page.tsx`)
**Route:** `/matches`

Messaging interface:
- Left sidebar: Conversation list
- Center: Chat messages
- Bottom: Message input with file upload

**Features:**
- Text messaging
- Photo uploads
- Video uploads
- Message history
- Real-time updates

### Profile Page (`app/profile/page.tsx`)
**Route:** `/profile`

Profile editing:
- Edit basic info (name, age, location)
- Bio textarea
- Relationship goal selector
- Interests input
- Photo gallery
- Video list
- Save button

**Features:**
- Image preview with delete
- File upload with FileReader
- Form validation
- LocalStorage persistence

## Data Management

### Database (`lib/db.ts`)

**Types:**
```typescript
User {
  id: string
  name: string
  age: number
  gender: 'male' | 'female'
  relationshipGoal: 'marriage' | 'serious' | 'dating'
  bio: string
  photos: string[] // base64 data URLs
  videos: string[] // base64 data URLs
  interests: string[]
  location: string
  createdAt: number
}

Match {
  id: string
  userId: string
  matchedUserId: string
  status: 'liked' | 'disliked' | 'matched'
  createdAt: number
}

Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  createdAt: number
  read: boolean
}

Conversation {
  id: string
  participants: [string, string]
  lastMessage?: string
  lastMessageTime?: number
  createdAt: number
}
```

**Database Methods:**
```typescript
Database.getUsers(): User[]
Database.saveUsers(users: User[]): void
Database.getMatches(): Match[]
Database.saveMatches(matches: Match[]): void
Database.getMessages(): Message[]
Database.saveMessages(messages: Message[]): void
Database.getConversations(): Conversation[]
Database.saveConversations(conversations: Conversation[]): void
Database.getCurrentUser(): User | null
Database.setCurrentUser(user: User | null): void
```

### Auth Context (`app/auth-context.tsx`)

**Context Values:**
```typescript
{
  currentUser: User | null
  isLoading: boolean
  login: (userId: string) => void
  logout: () => void
  updateProfile: (user: User) => void
  createUser: (user: User) => void
}
```

**Usage:**
```tsx
const { currentUser, login, logout, updateProfile } = useAuth();
```

## Styling

### Design Tokens (`app/globals.css`)

**Color System:**
- `--primary` - Warm orange/coral
- `--secondary` - Soft purple
- `--accent` - Golden-amber
- `--background` - Off-white/dark gray
- `--foreground` - Dark/light text
- `--muted` - Subtle backgrounds
- `--border` - Border colors

**Responsive Design:**
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Full-screen cards on mobile
- Grid layout on desktop

## File Upload Flow

1. User selects file from input
2. FileReader converts to base64
3. Data URL stored in state
4. Preview shown before save
5. On save, stored in localStorage
6. Retrieved and displayed with `<img>` or `<video>` tags

## Matching Logic

1. User swipes (like/dislike)
2. Match record created with status 'liked' or 'disliked'
3. Check for reverse match (other user also liked)
4. If mutual match:
   - Create conversation
   - Update match status to 'matched'
5. Display in Matches tab

## State Flow

```
Login Screen
    ↓
Select User
    ↓
AuthProvider.login()
    ↓
currentUser set in context
    ↓
Redirect to /
    ↓
Discover Page shows profiles
    ↓
User swipes (like/dislike)
    ↓
Match saved to localStorage
    ↓
If mutual match → Conversation created
    ↓
User can chat in Matches tab
    ↓
User can edit profile in Profile tab
```

## Performance Tips

- SwipeCard uses React.memo for optimization
- Images loaded from Unsplash CDN (optimized)
- localStorage used for instant access
- No network calls (demo mode)
- Smooth 60fps animations

## Accessibility

- Semantic HTML elements
- ARIA labels on buttons
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly

## Browser Storage

localStorage keys:
- `ethiomatch_users` - User profiles
- `ethiomatch_matches` - Match history
- `ethiomatch_messages` - All messages
- `ethiomatch_conversations` - Chat rooms
- `ethiomatch_current_user` - Active user

---

**Understanding the component structure helps with:**
- Adding new features
- Modifying existing components
- Managing state
- Styling consistently
