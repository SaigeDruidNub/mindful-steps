# 📸 Photo Capture Testing Guide

## How to Test Photo Capture

### Option 1: Test Button (Easiest)
1. Open the app
2. Look for the "📷 Test Camera" button on the main page
3. Click it to immediately open the camera interface
4. Take or upload a photo
5. Check the gallery to see your photo

### Option 2: During Mindful Walk
1. Click "Start Walking" to begin step counting
2. Wait for a mindful break (steps will simulate and increase)
3. When the break modal appears:
   - If it's a **photo prompt**: You'll see a prominent "📸 Take Photo Now" button
   - If it's a **sensory/breathing prompt**: You'll see an optional "📷 Add Photo (Optional)" button
4. Click the photo button to open camera
5. Capture or upload photo
6. Add a note (optional)
7. Save the photo
8. Check gallery

### Option 3: Camera Permission Test
1. Open browser dev tools (F12)
2. Go to console
3. Type: `testCameraAccess()` (no window. needed)
4. This tests if your browser can access the camera

### Option 4: Manual Trigger
1. Open browser dev tools (F12)
2. Go to console
3. Type: `window.testPhotoCapture()` (if available)
4. This will trigger the camera interface

## 🎯 What You Should See

### Camera Interface:
- **Header**: "Photo Capture" title with close button
- **Prompt Info**: Shows which prompt triggered the photo
- **Photo Area**: Large area for camera/upload
- **Options**: "Take Photo" and "Upload" buttons
- **Note Section**: Text area for adding thoughts
- **Actions**: "Save Photo" and "Cancel" buttons

### Gallery Updates:
- Photo count on main button should increase
- New photo appears in gallery
- Photo is linked to the prompt that triggered it

## 🔍 Troubleshooting

### If camera doesn't open:
1. **Test permissions first**: Open console and run `testCameraAccess()`
2. **Check browser console** for permission errors
3. **Make sure you're not on the gallery page**
4. **Try the "Test Camera" button first**

### Common camera issues:
- **Permission denied**: Browser asks for camera permission - click "Allow"
- **No camera found**: Device doesn't have a camera or it's disabled
- **Camera in use**: Another app is using the camera
- **HTTPS required**: Some browsers require HTTPS for camera access

### If photo doesn't save:
1. Check that you clicked "Save Photo" (not "Cancel")
2. Look for any error messages
3. Refresh and check gallery again

### If gallery count doesn't update:
1. Navigate away from gallery and back
2. The count should update when you return to main page

### Browser compatibility:
- **Chrome/Edge**: Should work well on desktop and mobile
- **Firefox**: May require HTTPS for camera access
- **Safari**: Works on iOS, may need user gesture first
- **Mobile browsers**: Usually work better than desktop

## 📱 Mobile vs Desktop

### Desktop:
- Upload button works best
- Camera button may request camera permissions
- File picker opens for image selection

### Mobile:
- Camera button opens native camera app
- Upload button opens photo gallery
- Both options should work seamlessly

## 🎨 Photo Features

Each photo includes:
- **Image**: The captured/uploaded photo
- **Prompt**: Which mindful exercise triggered it
- **Note**: Your personal thoughts (optional)
- **Timestamp**: When it was captured
- **Type**: Photo, Sensory, Breathing, or Reflection

The gallery organizes all these photos so you can look back at your mindful journey!