# 🚀 How to Preview Your Mindful Steps App

## Option 1: Full Next.js App (Recommended)

### Prerequisites
Make sure you have Node.js installed on your system. If not, download it from [nodejs.org](https://nodejs.org/)

### Steps to Run:
1. **Open Terminal/Command Prompt**:
   - Press `Win + R`, type `cmd` or `powershell`, and press Enter
   - Or open Windows Terminal if you have it

2. **Navigate to Project**:
   ```bash
   cd C:\Users\jayde\Documents\Nubbernaut\new-raindrop-code\mindful-steps
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Your Browser**:
   - Navigate to `http://localhost:3000`
   - The app will auto-reload when you make changes

## Option 2: Quick HTML Preview (No Installation Needed)

I'll create a simple HTML version you can open directly in your browser to see the concept in action.

### To Use:
1. Find the file `preview.html` in the mindful-steps folder
2. Double-click it to open in your browser
3. This shows the basic UI and interactions (simulated step counting)

## Option 3: Mobile Preview (Best Experience)

### For Mobile Testing:
1. **Run the Next.js app** using Option 1
2. **Find your local IP address**:
   - Open Command Prompt and type: `ipconfig`
   - Look for "IPv4 Address" (usually 192.168.x.x)
3. **On your phone**:
   - Connect to the same WiFi network
   - Open browser and go to: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`
4. **Install as PWA**:
   - In Chrome/Safari, look for "Add to Home Screen"
   - Install for native app experience

## 🎯 What to Look For:

### Desktop Preview:
- Clean, modern interface
- Step counter display
- Break status indicator
- Start/Stop/Reset controls
- Responsive design

### Mobile Preview (Best):
- Touch-friendly controls
- PWA install prompt
- Motion sensor permissions
- Camera permissions for photos
- Native app-like experience

## 🔧 Troubleshooting:

**If npm install fails:**
- Try `npm install --force`
- Or delete `node_modules` and package-lock.json, then try again

**If localhost:3000 doesn't work:**
- Check if another app is using port 3000
- Try `npm run dev -- -p 3001` for a different port

**If you see errors:**
- Make sure you're in the correct directory
- Check that Node.js is properly installed

## 📱 Features to Test:

1. **Start Walking** - Begin step counting
2. **Break System** - Wait for mindful breaks (or simulate steps)
3. **Photo Prompts** - Test camera integration
4. **Responsive Design** - Resize browser window
5. **PWA Features** - Try installing on mobile

The app works best on mobile devices with motion sensors, but the desktop version gives you a great preview of the interface and functionality!