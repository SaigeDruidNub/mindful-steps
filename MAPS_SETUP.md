# 🗺️ Google Maps Integration Setup Guide

## Overview

The Mindful Steps app now includes Google Maps integration to show your walking route in real-time. Here's how to set it up:

## 🔑 Getting Your Google Maps API Key

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a project" → "NEW PROJECT"
4. Enter project name (e.g., "Mindful Steps")
5. Click "CREATE"

### Step 2: Enable Maps JavaScript API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Maps JavaScript API"
3. Click on it and then "ENABLE"

### Step 3: Enable Geocoding API (Optional but Recommended)
1. Search for "Geocoding API"
2. Click on it and then "ENABLE"

### Step 4: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "API key"
3. Copy the API key that appears

### Step 5: Secure Your API Key
1. Click on your API key name to edit it
2. Under "API restrictions", select "HTTP referrers"
3. Add your website domains:
   - For local development: `http://localhost:3000/*`
   - For production: `https://yourdomain.com/*`
4. Click "SAVE"

## ⚙️ Configuring the App

### Step 1: Add API Key to Environment (Recommended)
Create or edit `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyYourActualApiKeyHere
```

### Step 2: Restart Development Server
After adding the API key to `.env.local`, restart your development server:

```bash
npm run dev
```

### Alternative: Direct Code Setup (Not Recommended)
If you prefer not to use environment variables, you can add the key directly to `src/components/MapView.tsx`, but this is less secure.

## 🔐 Why Use Environment Variables?

✅ **Security**: API key won't be committed to git  
✅ **Flexibility**: Easy to change keys without code changes  
✅ **Best Practice**: Standard approach for API keys in Next.js  
✅ **Production Ready**: Works seamlessly in deployment

## 📱 Features Available

### Real-Time Tracking
- ✅ Shows your current location with a blue dot
- ✅ Draws your walking path as you move
- ✅ Updates distance and duration in real-time
- ✅ Centers map on your current position

### Location Statistics
- ✅ Total distance walked
- ✅ Walking duration
- ✅ Pace (minutes per kilometer)
- ✅ GPS accuracy indicator
- ✅ Number of tracked points

### Map Controls
- ✅ Zoom in/out
- ✅ Map type switching (roadmap, satellite, hybrid, terrain)
- ✅ Fullscreen mode
- ✅ Street view (disabled for walking focus)

## 🌐 Browser Requirements

### Location Services
- **HTTPS Required**: Most browsers require HTTPS for location access
- **User Permission**: Users must allow location access
- **Mobile First**: Works best on mobile devices with GPS
- **Desktop Support**: Works on laptops with WiFi positioning

### Browser Compatibility
- ✅ Chrome/Edge (full support)
- ✅ Firefox (may require HTTPS)
- ✅ Safari (iOS and macOS)
- ⚠️ Some browsers may need user gesture first

## 🔧 Troubleshooting

### "Location services not supported"
- Browser doesn't have geolocation API
- Very old browser version
- Incognito/private mode (sometimes)

### "Location access denied"
- User denied permission
- Click the location icon in browser address bar
- Grant permission and refresh page

### "Failed to load Google Maps"
- Invalid API key
- API key not enabled for Maps JavaScript API
- Internet connection issues
- Firewall blocking Google Maps

### Map not showing path
- Location tracking not started
- Start walking to begin tracking
- Check if GPS has good signal

## 🚀 Testing the Map

### Quick Test
1. Click "Show Map" button
2. Allow location permission when prompted
3. Start walking to see the path appear
4. Check distance updating in real-time

### Desktop Testing
1. Use Chrome/Edge for best results
2. May need to grant location permission
3. WiFi positioning may be less accurate than GPS

### Mobile Testing
1. Best experience on smartphones
2. Enable GPS/location services
3. Grant app permission when prompted
4. Walk outside for best GPS accuracy

## 💡 Pro Tips

### Battery Life
- Location tracking uses battery
- Consider outdoor walks for better GPS
- High accuracy mode uses more power

### Accuracy
- GPS: 5-10 meters accuracy
- WiFi: 20-50 meters accuracy
- Cell tower: 100-1000 meters accuracy

### Privacy
- Location data stored locally only
- No data sent to external servers
- Clear browser data to remove location history

---

## 🎯 Next Steps

Once set up, you'll see:
1. 🗺️ Live map of your walking route
2. 📊 Real-time distance and pace stats  
3. 📍 Current location tracking
4. 🛤️ Visual path of your mindful journey

Happy mindful walking! 🚶‍♂️✨