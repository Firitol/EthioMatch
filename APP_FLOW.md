# Ethiomatch - App Flow & User Journey

## 🗺️ Complete User Journey

### First Time User Flow

```
Open ethiomatch.com
        ↓
    Landing on /login
        ↓
    [Login Screen]
    See 9 demo users with profiles
        ↓
    User clicks "Login as [Name]"
        ↓
    Auth context sets currentUser
        ↓
    Redirect to / (Discover page)
        ↓
    [Discover Screen]
    User sees first profile card
        ↓
    User continues app experience...
```

### Main App Navigation

```
┌─────────────────────────────────────┐
│        TOP NAVIGATION BAR           │
│  Logo  Discover  Matches  Profile   │
│                           Logout    │
└─────────────────────────────────────┘
            ↓
    ┌──────────────┬──────────────┬──────────────┐
    ↓              ↓              ↓              ↓
[Discover]    [Matches]       [Profile]   [Logout]
   (/)         (/matches)     (/profile)   (/login)
```

## 🎴 Discover Page Flow (`/`)

### User Sees Profile Card

```
Load Discover Page
        ↓
Fetch current user
        ↓
Load all users
        ↓
Filter: Remove current user & already swiped
        ↓
Get filtered users list
        ↓
Display first user card
        ├─ Photo gallery
        ├─ Name, age, location
        ├─ Relationship goal
        ├─ Bio & interests
        └─ Like/Dislike buttons
```

### User Swipes Left (Dislike)

```
User clicks ❌ or drags LEFT
        ↓
onDislike() called with userId
        ↓
Create Match record:
  - status: 'disliked'
  - userId: current user
  - matchedUserId: swiped user
        ↓
Save to localStorage
        ↓
Move to next profile (currentIndex++)
        ↓
Display next card
```

### User Swipes Right (Like)

```
User clicks ❤️ or drags RIGHT
        ↓
onLike() called with userId
        ↓
Create Match record:
  - status: 'liked'
  - userId: current user
  - matchedUserId: swiped user
        ↓
Check for reverse match
(Does other user like me?)
        ├─ Yes: MUTUAL MATCH! 🎉
        │    ├─ Create conversation
        │    ├─ Update match status to 'matched'
        │    └─ Now can message each other
        │
        └─ No: Keep waiting
             (If they like you later, match happens)
        ↓
Move to next profile
        ↓
Display next card
```

### No More Profiles

```
currentIndex >= filtered users length
        ↓
Display "No more profiles!" screen
        ↓
Suggest viewing matches or logout
        ↓
User can still navigate to /matches or /profile
```

## 💬 Matches Page Flow (`/matches`)

### Load Matches Page

```
Open /matches
        ↓
Load current user
        ↓
Fetch all conversations
        ↓
Filter: Only conversations with current user
        ↓
If no conversations:
  - Show "No matches yet" message
  - Suggest keep discovering
  
If has conversations:
  - Show list on left sidebar
  - First conversation selected by default
```

### Select Conversation

```
User clicks conversation in sidebar
        ↓
setSelectedConversation(convId)
        ↓
Fetch all messages
        ↓
Filter: Only messages for this conversation
        ↓
Display chat messages
        ├─ Messages from me (right, primary color)
        └─ Messages from them (left, muted color)
```

### Send Text Message

```
User types in message input
        ↓
User presses Enter or clicks Send
        ↓
Validate:
  ├─ Has text OR media? YES
  └─ Has text OR media? NO → Disable send
        ↓
Create Message object:
  - id: unique
  - conversationId
  - senderId: current user
  - receiverId: other user
  - content: message text
  - createdAt: timestamp
        ↓
Save to localStorage
        ↓
Add to messages display
        ↓
Clear input field
        ↓
Scroll to new message
```

### Share Photo

```
User clicks Paperclip icon
        ↓
File picker opens
        ↓
User selects IMAGE file
        ↓
FileReader reads file
        ↓
Convert to base64 data URL
        ↓
Store in selectedMedia state
        ↓
Show preview of image
        ↓
User can:
  ├─ Click X to cancel
  └─ Click Send to send with message
```

### Share Video

```
User clicks Paperclip icon
        ↓
File picker opens (set to accept video)
        ↓
User selects VIDEO file
        ↓
FileReader reads file
        ↓
Convert to base64 data URL
        ↓
Store in selectedMedia state
        ↓
Show preview of video
        ↓
User can:
  ├─ Click X to cancel
  └─ Click Send to send with message
```

### Send Message with Media

```
User types message (optional)
        ↓
User selects media (photo/video)
        ↓
User clicks Send
        ↓
Create Message object:
  - content: text message
  - mediaUrl: base64 data URL
  - mediaType: 'image' | 'video'
        ↓
Save to localStorage
        ↓
Message shows with media + text
        ↓
Clear input & media preview
```

## 👤 Profile Page Flow (`/profile`)

### Load Profile Page

```
Open /profile
        ↓
Load current user from context
        ↓
Populate form with user data:
  - name
  - age
  - location
  - bio
  - relationshipGoal
  - interests
  - photos[]
  - videos[]
```

### Edit Basic Info

```
User edits name, age, location, bio
        ↓
State updates in real-time
        ↓
Changes not saved yet (local state only)
        ↓
User can:
  ├─ Continue editing
  ├─ Upload photos/videos
  └─ Click Save Profile
```

### Select Relationship Goal

```
User opens Select dropdown
        ↓
Options show:
  - Marriage
  - Serious Relationship
  - Dating
        ↓
User selects option
        ↓
State updates
        ↓
Selection reflected in form
```

### Edit Interests

```
User sees "Travel, Reading, Cooking" format
        ↓
User edits text:
  - Can add comma-separated values
  - Can clear and restart
  - No validation (free text)
        ↓
User types interests separated by commas
        ↓
State updates as they type
```

### Upload Photos

```
User clicks "Add Photo" button
        ↓
File picker opens (image filter)
        ↓
User selects 1+ images
        ↓
For each image:
  - FileReader reads file
  - Convert to base64 data URL
  - Add to photos[] state
        ↓
Photo appears in grid with preview
        ↓
User can:
  ├─ Hover over photo
  ├─ See X button appear
  └─ Click X to delete from list
        ↓
User can add more photos
        ↓
Changes shown locally (not saved)
```

### Upload Videos

```
User clicks "Add Video" button
        ↓
File picker opens (video filter)
        ↓
User selects 1+ videos
        ↓
For each video:
  - FileReader reads file
  - Convert to base64 data URL
  - Add to videos[] state
        ↓
Video appears in list with Play icon
        ↓
User can:
  ├─ Hover over video
  ├─ See X button appear
  └─ Click X to delete from list
        ↓
User can add more videos
        ↓
Changes shown locally (not saved)
```

### Save Profile

```
User clicks "Save Profile" button
        ↓
Button shows "Saving..." state
        ↓
Create updated user object:
  - All edited fields
  - New photos[] array
  - New videos[] array
        ↓
Call updateProfile()
        ↓
Auth context saves to localStorage:
  - Updates user in users[]
  - Sets as currentUser
        ↓
Button shows "Saved!" message
        ↓
2 seconds later: Button back to normal
        ↓
Data now persisted
        ↓
Other pages can access changes
```

### Cancel Edits

```
User clicks "Cancel" button
        ↓
Navigate away without saving
        ↓
All local edits discarded
        ↓
Redirect to / (home)
```

## 🔐 Login Flow (`/login`)

### Initial Load

```
Visit /login or not authenticated
        ↓
Fetch all users from database
        ↓
Display users in grid
        ↓
Show preview cards:
  - Photo (if available)
  - Name, age
  - Relationship goal
  - Bio excerpt
  - Interests preview
  - "Login as [Name]" button
```

### User Selects Profile

```
User clicks "Login as Aisha"
        ↓
handleLogin('1') called
        ↓
Auth context calls login()
        ↓
Find user by ID
        ↓
Call createUser() or setCurrentUser()
        ↓
Update context: currentUser = user
        ↓
Navigate to /
        ↓
App now loaded with that user
```

## 🔄 State Management Flow

### Auth Context

```
AuthProvider
    ↓
currentUser state
    ├─ null (logged out)
    └─ User object (logged in)
        ↓
isLoading state
    ├─ true (checking session)
    └─ false (done loading)
        ↓
Methods:
    ├─ login(userId)
    ├─ logout()
    ├─ updateProfile(user)
    └─ createUser(user)
```

### Component State Examples

**Discover Page**:
```
users[]              → Filtered profiles
currentIndex         → Current card position
matches[]            → Swipe history
```

**Matches Page**:
```
conversations[]      → All chats
selectedConversation → Active chat
messages[]           → Messages for chat
messageText          → Input text
selectedMedia        → Uploading file
```

**Profile Page**:
```
name, age, location  → Text inputs
relationshipGoal     → Select value
interests            → Text input
photos[], videos[]   → File arrays
isSaving             → Button state
```

## 📊 Data Flow Diagram

```
┌──────────────────┐
│  Browser         │
│  localStorage    │
│                  │
│  users[]         │
│  matches[]       │
│  messages[]      │
│  conversations[] │
└────────┬─────────┘
         │
    Read/Write
         │
┌────────▼─────────┐
│  Database class  │
│  (lib/db.ts)     │
│                  │
│  getUsers()      │
│  getMatches()    │
│  getMessages()   │
│  etc.            │
└────────┬─────────┘
         │
    Uses
         │
┌────────▼─────────────────┐
│  AuthContext + Pages     │
│                          │
│  currentUser state       │
│  useAuth() hook          │
│  useRouter() navigation  │
└────────┬─────────────────┘
         │
    Display/Update
         │
┌────────▼─────────────────┐
│  UI Components           │
│                          │
│  Navigation              │
│  SwipeCard               │
│  Chat interface          │
│  Profile form            │
└──────────────────────────┘
```

## 🔄 Key Interactions

### Like Someone → Create Match

```
User likes Profile A
    ↓
Check if Profile A liked User
    ├─ YES: Mutual match! Create conversation
    └─ NO: Just record the like
    ↓
Save match record
    ↓
Show next profile
    ↓
If ever mutual → Conversation appears
```

### Send Message → Display

```
User sends message
    ↓
Save to localStorage
    ↓
Add to messages array
    ↓
Re-render messages list
    ↓
Message appears on screen
    ↓
Instant (no API call)
```

### Edit Profile → Persist

```
User edits field
    ↓
State updates (not saved)
    ↓
User clicks Save
    ↓
updateProfile() called
    ↓
Auth context updates localStorage
    ↓
currentUser updated
    ↓
All pages can use new data
    ↓
Changes stick across sessions
```

## ⏱️ Typical User Session

```
Time  Event
────────────────────────────────────
00:00 User arrives, selects login
01:00 Discover page loads
05:00 Swipes through 5 profiles
10:00 Gets 2 matches
15:00 Navigates to Matches page
20:00 Opens conversation
30:00 Chats and sends photos
45:00 Goes to Profile page
50:00 Uploads new photos
52:00 Saves profile
55:00 Back to Discover
60:00 Session ends (browser closed)
────────────────────────────────────
Next session: Logs back in, data intact
```

---

This flow demonstrates how all components work together to create a cohesive user experience!
