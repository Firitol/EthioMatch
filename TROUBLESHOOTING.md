# Ethiomatch - Troubleshooting Guide

## Common Issues & Solutions

### 🔴 App Won't Load

**Problem**: Page is blank or shows loading spinner forever

**Solutions**:
1. Check browser console for errors (F12 → Console)
2. Clear browser cache and reload
3. Make sure npm dependencies installed:
   ```bash
   npm install
   ```
4. Kill dev server and restart:
   ```bash
   npm run dev
   ```
5. Check if port 3000 is available

**If still not working**:
- Try different browser
- Check Node.js version (should be 18+)
- Delete `node_modules` and `.next` folder, then `npm install` again

---

### 🔴 Login Screen Shows But Can't Select User

**Problem**: User cards don't respond to clicks

**Solutions**:
1. Refresh the page (Ctrl+R or Cmd+R)
2. Check that JavaScript is enabled in browser
3. Try a different browser
4. Clear localStorage:
   ```javascript
   localStorage.clear()
   // Then refresh
   ```

**Check console**: Look for JavaScript errors in F12 → Console

---

### 🔴 After Logging In, Can't See Profiles to Swipe

**Problem**: Discover page is blank

**Solutions**:
1. Make sure you logged in successfully
2. Wait a moment for profiles to load
3. Check console for errors
4. Try navigating to `/` directly in URL bar
5. Logout and login again

**Possible Causes**:
- All profiles already swiped (unlikely with demo data)
- Current user ID not set in context
- Database not initialized

---

### 🔴 Swipe Cards Not Responding

**Problem**: Can't swipe cards or click buttons

**Solutions**:
1. Try clicking buttons instead of dragging
2. Refresh the page
3. Make sure you're on a card (not scrolled past it)
4. Check mobile viewport - buttons might be off-screen
5. Try in browser's responsive mode for mobile testing

**Debug**: Open console and check:
```javascript
// Check if user is logged in
localStorage.getItem('ethiomatch_current_user')
// Should return a user object
```

---

### 🔴 Can't See Matches or Messaging

**Problem**: Matches page shows "No matches yet" but you've swiped

**Solutions**:
1. Make sure you created a mutual match:
   - User A likes User B
   - Log out, log in as User B
   - User B likes User A
   - Now they match!

2. Clear browser data and try again:
   ```javascript
   localStorage.clear()
   ```

3. Check that both users exist:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('ethiomatch_users')))
   ```

**Remember**: Conversation only created when BOTH users like each other

---

### 🔴 Photos Not Uploading in Profile

**Problem**: Click "Add Photo" but nothing happens

**Solutions**:
1. Check file format (must be: jpg, png, gif, webp)
2. File might be too large - try image under 5MB
3. Clear browser cache
4. Try different browser
5. Check console for errors

**Debug**: Test file upload in console:
```javascript
// Create test image
const testImg = 'data:image/png;base64,...'
localStorage.setItem('test', testImg)
// See if it stores
```

---

### 🔴 Photos/Videos Not Showing in Messages

**Problem**: Upload succeeds but media doesn't display

**Solutions**:
1. Refresh the page
2. Check that preview showed before sending
3. Try different file format
4. File might be corrupted - try different file
5. Check browser storage limits haven't been exceeded:
   ```javascript
   // Check localStorage size
   console.log(JSON.stringify(localStorage).length)
   ```

**Note**: localStorage has ~5-10MB limit per domain
If you have many large videos, may exceed limit

---

### 🔴 Messages Not Saving

**Problem**: Send message but it disappears

**Solutions**:
1. Check that conversation exists:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('ethiomatch_conversations')))
   ```

2. Ensure both users are matched:
   - Messaging requires mutual match
   - Check matches list

3. Clear messages and try again:
   ```javascript
   localStorage.removeItem('ethiomatch_messages')
   localStorage.removeItem('ethiomatch_conversations')
   // Refresh page
   ```

4. Try a simple text message first (no media)

---

### 🔴 Profile Changes Not Saving

**Problem**: Edit profile but changes disappear on refresh

**Solutions**:
1. Make sure you clicked "Save Profile" button
   - Button should show "Saving..." then "Saved!"
   
2. Check localStorage is working:
   ```javascript
   localStorage.setItem('test', 'hello')
   console.log(localStorage.getItem('test')) // Should show 'hello'
   ```

3. Browser might have storage disabled:
   - Check privacy settings
   - Try disabling privacy extensions

4. Storage quota might be full:
   ```javascript
   try {
     localStorage.setItem('test', 'x')
   } catch(e) {
     console.log('Storage full!')
   }
   ```

---

### 🔴 Can't Logout

**Problem**: Logout button doesn't work

**Solutions**:
1. Click it again (might need double-click)
2. Refresh page after clicking logout
3. Manual logout in console:
   ```javascript
   localStorage.removeItem('ethiomatch_current_user')
   window.location.reload()
   ```

4. Clear all storage:
   ```javascript
   localStorage.clear()
   window.location.reload()
   ```

---

### 🔴 App Slow or Laggy

**Problem**: Swiping is slow, UI feels sluggish

**Solutions**:
1. Close other tabs/applications
2. Check browser performance:
   - F12 → Performance tab
   - Record performance profile
   
3. Clear browser cache:
   - Ctrl+Shift+Delete
   - Clear all cached images and files

4. Try different browser

5. Check for very large files:
   ```javascript
   // Check total localStorage size
   let total = 0
   for(let key in localStorage) {
     total += localStorage[key].length
   }
   console.log(total, 'bytes')
   ```

6. Reset app:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

---

### 🔴 Multiple Users Switch Problem

**Problem**: Logged in as User A, but some user's data shows

**Solutions**:
1. CurrentUser might not be updating:
   ```javascript
   // Check current user
   console.log(JSON.parse(localStorage.getItem('ethiomatch_current_user')))
   ```

2. Hard refresh (Ctrl+Shift+R):
   - Clears cache and reloads

3. Clear current user and reload:
   ```javascript
   localStorage.removeItem('ethiomatch_current_user')
   location.reload()
   ```

4. Re-login to confirm

---

### 🔴 Photo Gallery Navigation Broken

**Problem**: Arrow buttons don't work or photos don't change

**Solutions**:
1. Make sure profile has multiple photos:
   ```javascript
   // Check user photos
   const user = JSON.parse(localStorage.getItem('ethiomatch_current_user'))
   console.log(user.photos)
   ```

2. Buttons disabled if < 2 photos - add more

3. Refresh page

4. Try keyboard arrow keys instead of clicking

---

### 🔴 Empty State Messages Confusing

**Problem**: Seeing "No matches yet" when expecting profiles

**Explanation**:
- **Discover page**: "No more profiles" = all profiles swiped already
  - Solution: Log in as different user
  
- **Matches page**: "No matches yet" = no mutual matches
  - Solution: Create matches first (see matching section)

---

## Debug Commands

Useful commands to run in browser console (F12):

```javascript
// Check if app has data
localStorage

// View current user
JSON.parse(localStorage.getItem('ethiomatch_current_user'))

// View all users
JSON.parse(localStorage.getItem('ethiomatch_users'))

// View all matches
JSON.parse(localStorage.getItem('ethiomatch_matches'))

// View all messages
JSON.parse(localStorage.getItem('ethiomatch_messages'))

// View all conversations
JSON.parse(localStorage.getItem('ethiomatch_conversations'))

// Clear everything (CAUTION!)
localStorage.clear()

// Check storage size
Object.keys(localStorage).reduce((total, key) => total + localStorage[key].length, 0) + ' bytes'

// Find mutual matches for current user
(() => {
  const user = JSON.parse(localStorage.getItem('ethiomatch_current_user'))
  const matches = JSON.parse(localStorage.getItem('ethiomatch_matches'))
  const myLikes = matches.filter(m => m.userId === user.id && m.status === 'liked')
  const mutual = myLikes.filter(like => 
    matches.some(m => m.userId === like.matchedUserId && m.matchedUserId === user.id && m.status === 'liked')
  )
  console.log('Mutual matches:', mutual)
})()
```

---

## Performance Tips

### Reduce Lag
1. Keep photos under 500KB each
2. Use common image formats (jpg, png)
3. Don't upload 4K resolution videos
4. Clear browser cache regularly
5. Close background apps

### Optimize Storage
1. Delete old messages (manually edit localStorage)
2. Remove unused photos from profiles
3. Don't upload full-length videos
4. Check what's taking space:
   ```javascript
   Object.entries(localStorage).map(([k,v]) => [k, v.length])
   ```

---

## When All Else Fails

**Nuclear Option - Reset Everything**:

```javascript
// Clear all app data
localStorage.clear()

// Reload page
location.reload()

// Select user again from login
```

This removes all data and returns to fresh state.

---

## Getting Help

If you can't solve the issue:

1. **Check console errors** (F12 → Console)
2. **Share the error message** in full
3. **Describe what you were doing** when it happened
4. **Mention browser version**
5. **Check if cache needs clearing**
6. **Try incognito mode** to rule out extensions

---

## Technical Support Resources

- **Next.js Issues**: https://github.com/vercel/next.js
- **React Issues**: https://react.dev
- **Tailwind Issues**: https://tailwindcss.com
- **Browser Console**: F12 → Console tab

---

## Quick Checklist

Before declaring something broken:
- [ ] Refresh page (Ctrl+R)
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Clear cache (Ctrl+Shift+Delete)
- [ ] Try incognito mode
- [ ] Try different browser
- [ ] Check browser console (F12)
- [ ] Restart dev server
- [ ] Clear localStorage and reset

Most issues are resolved by one of these steps!

---

**Still stuck?** Check PROJECT_SUMMARY.md or ETHIOMATCH_GUIDE.md for more details.
