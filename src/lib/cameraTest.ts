// Alternative simplified camera capture for testing
export function testCameraAccess() {
  // This function can be called from browser console to test camera
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      console.log('✅ Camera access successful!');
      console.log('Stream:', stream);
      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
    })
    .catch(error => {
      console.error('❌ Camera access failed:', error);
      
      if (error.name === 'NotAllowedError') {
        console.log('Camera permission denied by user');
      } else if (error.name === 'NotFoundError') {
        console.log('No camera device found');
      } else if (error.name === 'NotReadableError') {
        console.log('Camera is already in use by another application');
      }
    });
}

// Add to window for console testing
if (typeof window !== 'undefined') {
  window.testCameraAccess = testCameraAccess;
}