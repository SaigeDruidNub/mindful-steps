# Environment Variable Troubleshooting

## 🔍 Debug Steps

### 1. Check if .env.local exists
In your terminal, run:
```bash
ls -la .env.local
```

### 2. Check the content
```bash
cat .env.local
```

### 3. Verify the exact format
Your .env.local should look exactly like this:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyYourActualApiKeyHere
```

**Common issues:**
- ❌ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = AIzaSy...` (extra spaces)
- ❌ `next_public_google_maps_api_key=AIzaSy...` (wrong case)
- ❌ `GOOGLE_MAPS_API_KEY=AIzaSy...` (missing NEXT_PUBLIC_ prefix)
- ❌ Quote marks around the value
- ❌ Missing equals sign

### 4. Check Next.js environment loading
Open browser console and run:
```javascript
console.log('All env vars:', Object.keys(process.env || {}));
```

### 5. Force restart (important!)
```bash
# Kill the process
Ctrl + C

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### 6. Check for multiple .env files
```bash
ls -la .env*
```
You should see:
- `.env.local` (your API key)
- `.env.example` (template file)

### 7. Verify in browser
After restarting, open browser console and check:
- The EnvDebug component should show your API key
- The MapView console logs should show the API key

## 🚨 Most Common Issues

### Issue: API key not found
**Cause**: .env.local not loaded properly
**Fix**: 
1. Verify filename is exactly `.env.local`
2. Restart dev server with `rm -rf .next && npm run dev`
3. Check browser console for environment variables

### Issue: Wrong key format
**Cause**: Typo in .env.local
**Fix**: 
1. No spaces around equals sign
2. EXACT case: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. No quotes around the value

### Issue: API key is placeholder
**Cause**: Didn't replace placeholder text
**Fix**: Replace `your_google_maps_api_key_here` with actual key

## 🧪 Quick Test
After following the steps, in browser console run:
```javascript
testGoogleMapsApiKey()
```

This should show:
- ✅ API key found
- ✅ API key format looks valid
- ✅ API key is valid and has proper permissions