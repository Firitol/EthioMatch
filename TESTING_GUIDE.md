# Testing Guide - Mobile App & Message Persistence

## Pre-Testing Setup

### Database Connection
Ensure your Neon PostgreSQL is connected:
1. Go to Settings > Vars in v0
2. Verify `DATABASE_URL` is set with your Neon connection string
3. The database schema should auto-initialize on first API call

### Environment
- Database: Neon PostgreSQL (production)
- API Routes: Fully implemented with fallback to localStorage
- Mobile Responsiveness: Tested at multiple breakpoints

## Testing Scenarios

### 1. Message Persistence (Critical)

#### Test 1.1: Messages Persist After Page Refresh
1. Login to app
2. Navigate to Messages page
3. Select a conversation or start a new one
4. Send a test message: "Test persistence"
5. Refresh the page (Cmd/Ctrl + R)
6. ✅ PASS: Message should still be visible
7. ✅ PASS: Message should appear immediately without needing server fetch

#### Test 1.2: Messages Sync Across Tabs
1. Open app in two browser tabs
2. In Tab 1: Navigate to a conversation
3. In Tab 2: Navigate to the same conversation
4. In Tab 1: Send message "Cross-tab test"
5. In Tab 2: Wait 2 seconds (polling interval)
6. ✅ PASS: Message appears in Tab 2 automatically

#### Test 1.3: Message History After Logout/Login
1. Login as user ID "1"
2. Send message: "Before logout"
3. Logout
4. Login as user ID "1" again
5. Navigate back to conversation
6. ✅ PASS: "Before logout" message is still there

#### Test 1.4: Token Deduction on Message Send
1. Login as free user with tokens
2. Check token count (should display in header)
3. Send a message
4. ✅ PASS: Token count decreases by 1
5. Send until tokens reach 0
6. ✅ PASS: Cannot send more messages without buying tokens

#### Test 1.5: Premium Users Unlimited Messages
1. Login as premium user (or upgrade via modal)
2. Send 10+ messages rapidly
3. ✅ PASS: All messages send successfully
4. ✅ PASS: Token count stays the same (shows ∞)

### 2. Mobile Responsiveness

#### Test 2.1: Mobile Layout (375px width - iPhone SE)
1. Open Chrome DevTools (F12)
2. Set viewport to iPhone SE (375×667)
3. Navigate through all pages:
   - Home page
   - Discover page
   - Messages page
   - Chat interface

**Home Page Checks:**
- ✅ Navigation is accessible
- ✅ Stats cards stack properly (2 per row)
- ✅ Action buttons are full-width
- ✅ Text is readable (no overflow)
- ✅ Padding is appropriate for small screen

**Discover Page Checks:**
- ✅ Photo is full-width, no horizontal scroll
- ✅ Profile card is centered
- ✅ Like/Dislike buttons are large enough (44x44px minimum)
- ✅ Buttons don't overlap
- ✅ Sidebar hidden on mobile (only visible on desktop)

**Messages Page Checks:**
- ✅ Chat is full-height (h-screen)
- ✅ Sidebar hidden (use back button instead)
- ✅ Input area doesn't get covered by keyboard
- ✅ Messages are properly aligned

**Chat Interface Checks:**
- ✅ Messages bubble width responsive
- ✅ Input field grows with text
- ✅ Send button accessible
- ✅ Media preview doesn't overflow
- ✅ Timestamp readable

#### Test 2.2: Tablet Layout (768px width - iPad)
1. Set viewport to iPad (768×1024)
2. Check all pages:

**Expected:**
- ✅ Sidebar appears on Messages page
- ✅ Grid layouts use more columns
- ✅ Padding increases appropriately
- ✅ No unnecessary white space

#### Test 2.3: Desktop Layout (1920px width)
1. Set viewport to 1920×1080
2. Check all pages:

**Expected:**
- ✅ Full multi-column layouts
- ✅ Optimal spacing
- ✅ All UI elements properly positioned
- ✅ No crowding or excessive spacing

#### Test 2.4: Responsive Text Sizes
Navigate through app and check:
- ✅ Headings scale from `text-lg/xl` mobile to `text-2xl/3xl` desktop
- ✅ Body text scales from `text-xs/sm` to `text-sm/base`
- ✅ All text remains readable at every breakpoint
- ✅ No text truncation on mobile

#### Test 2.5: Touch Targets (Mobile)
On actual mobile device or emulated:
- ✅ All buttons are at least 44x44px (iOS standard)
- ✅ Buttons have adequate spacing (8px minimum gap)
- ✅ Form inputs are large enough to tap accurately
- ✅ No tiny interactive elements

### 3. API Integration

#### Test 3.1: Messages API
1. Open DevTools > Network tab
2. Send a message
3. ✅ PASS: POST request to `/api/messages` succeeds (200-201)
4. ✅ PASS: Response includes: `id`, `conversationId`, `senderId`, `content`, `createdAt`
5. ✅ PASS: Database updates (if DB access available)

#### Test 3.2: Conversations API
1. In Messages page, create new conversation
2. ✅ PASS: POST request to `/api/conversations`
3. ✅ PASS: Response includes conversation ID and participants array
4. ✅ PASS: Conversation appears in list

#### Test 3.3: Users API
1. Update profile
2. ✅ PASS: PATCH request to `/api/users` succeeds
3. ✅ PASS: Profile data updates immediately
4. ✅ PASS: Changes persist after refresh

#### Test 3.4: Matches API
1. On Discover page, like/dislike a profile
2. ✅ PASS: POST request to `/api/matches`
3. ✅ PASS: Match created in database
4. ✅ PASS: Mutual match creates conversation automatically

### 4. Error Handling

#### Test 4.1: Network Error Fallback
1. Disconnect internet
2. Send message
3. ✅ PASS: App shows error or gracefully degrades
4. Reconnect
5. ✅ PASS: Message eventually syncs when connection restored

#### Test 4.2: Invalid Token
1. Delete conversation from message input
2. Manually send API request with invalid conversationId
3. ✅ PASS: API returns 400 or 404 error
4. ✅ PASS: App handles error gracefully

#### Test 4.3: No Tokens
1. Use up all tokens
2. Try to send message
3. ✅ PASS: Input is disabled or shows upgrade prompt
4. ✅ PASS: User can buy tokens or upgrade to premium

## Performance Metrics

Track these metrics:

### Load Times
- ✅ Home page: < 2 seconds
- ✅ Messages page: < 3 seconds (with message fetch)
- ✅ Discover page: < 3 seconds (with user load)
- ✅ Chat interface: < 1 second (on page load)

### Interaction Responsiveness
- ✅ Message send: < 500ms API response
- ✅ Like/Dislike: < 300ms API response
- ✅ Profile navigation: Instant (client-side)
- ✅ Message polling: 2-second updates (configurable)

### Memory Usage (on mobile)
- ✅ Messages page: < 50MB (with ~100 messages loaded)
- ✅ Chat interface: < 30MB
- ✅ Discover page: < 40MB (with ~20 user profiles)

## Browser Testing

### Desktop Browsers
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Mobile Browsers
- ✅ Mobile Chrome
- ✅ Mobile Safari (iOS)
- ✅ Samsung Internet

## Known Limitations & Workarounds

### Current Fallback Behavior
- If Neon API fails, app falls back to localStorage
- Users see data but changes may not persist after server restart
- Fallback is **temporary** - users should refresh to resync with database

### Message Polling
- Current: 2-second polling interval
- Trade-off: Slightly delayed updates vs. reduced server load
- Future: Upgrade to WebSockets for real-time (< 100ms)

## Completion Checklist

- [ ] All persistence tests pass
- [ ] All mobile tests pass at 3 breakpoints
- [ ] All API tests pass
- [ ] Error handling works gracefully
- [ ] Performance metrics acceptable
- [ ] Cross-browser tests pass
- [ ] No console errors
- [ ] No memory leaks (check DevTools Memory profile)
- [ ] Ready for production deployment

## Rollback Plan

If critical issues found:
1. Revert to previous commit
2. Disable new API routes
3. Revert components to use Database class only
4. Deploy hotfix

## Post-Deployment Monitoring

Monitor these in production:
- Error logs from `/api/*` routes
- User reports of message loss
- Performance metrics from analytics
- Database connection issues

## Support

For issues:
1. Check browser console for errors
2. Check Network tab for API response codes
3. Check database connection status
4. Review error logs in Vercel dashboard
