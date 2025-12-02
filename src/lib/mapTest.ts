// Google Maps API testing helper
export function testGoogleMapsApiKey() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  console.log('🔍 Google Maps API Key Test');
  console.log('==========================');
  
  if (!apiKey) {
    console.log('❌ No API key found');
    console.log('💡 Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
    return false;
  }
  
  console.log('✅ API key found:', apiKey.substring(0, 10) + '...');
  
  // Test if the API key format looks valid
  if (apiKey.length < 20) {
    console.log('⚠️ API key seems too short');
    return false;
  }
  
  if (apiKey === 'your_google_maps_api_key_here') {
    console.log('⚠️ Please replace the placeholder with your actual API key');
    return false;
  }
  
  console.log('✅ API key format looks valid');
  console.log('🌐 Testing API connectivity...');
  
  // Test the API key by attempting to load the Google Maps script
  const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  
  fetch(testUrl)
    .then(response => {
      if (response.ok) {
        console.log('✅ API key is valid and has proper permissions');
      } else {
        console.log('❌ API key invalid or missing permissions');
        console.log('📋 Response status:', response.status, response.statusText);
      }
    })
    .catch(error => {
      console.log('❌ Network error testing API key:', error);
    });
  
  return true;
}

// Add to window for console testing
if (typeof window !== 'undefined') {
  window.testGoogleMapsApiKey = testGoogleMapsApiKey;
}