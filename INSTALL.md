# Installation Instructions

## Development Setup

1. Install dependencies:
```bash
cd mindful-steps
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Mobile Installation (PWA)

### On iOS Safari:
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to install the app

### On Android Chrome:
1. Open the app in Chrome
2. Tap the menu button (three dots)
3. Tap "Add to Home screen" or "Install app"
4. Follow the prompts to install

## Features Implemented

### ✅ Core Functionality
- Step counting with device sensors
- Random break intervals (100-1500 steps)
- Mindful prompts with photos and sensory exercises
- Progress tracking and statistics
- PWA support for mobile installation

### 🔄 Current Status
- Basic step counting (DeviceMotion API fallback included)
- Photo and sensory prompts system
- Break scheduling and notifications
- Responsive mobile-friendly design

### 📱 Mobile Testing
The app works best on mobile devices with motion sensors. On desktop, it will show a fallback mode with manual step simulation.

## Next Steps

To enhance the app further, you could:

1. **Add More Prompts**: Expand the prompt library with more diverse exercises
2. **Achievement System**: Implement gamification with badges and milestones
3. **Data Visualization**: Add charts and graphs for progress tracking
4. **Social Features**: Allow sharing of photos and progress
5. **Offline Support**: Enhanced offline capabilities with background sync
6. **Accessibility**: Improve accessibility features for all users
7. **Advanced Analytics**: More detailed step and activity analytics

## Troubleshooting

### Step Counting Not Working
- Ensure you're using a mobile device with motion sensors
- Grant permission for motion sensors when prompted
- Try refreshing the page and restarting step counting

### Camera Not Working
- Grant camera permissions when prompted
- Ensure your device has a camera
- Some browsers may block camera access in non-secure contexts

### Breaks Not Triggering
- Make sure step counting is active
- Check your break interval settings
- Walk naturally to ensure step detection

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **PWA**: Built-in Next.js PWA support
- **Device APIs**: Device Motion API, Pedometer API
- **Storage**: LocalStorage for offline functionality

The app is designed as a Progressive Web App (PWA) to provide a native-like experience on mobile devices while remaining accessible through any modern web browser.