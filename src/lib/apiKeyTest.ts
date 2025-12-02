// Quick API key test
export function testApiKeyDirectly() {
  console.log('🔍 Testing Google Maps API Key directly...');
  
  const apiKey = 'AIzaSyCw40dfjE_jvBe8hQ-OWookgNdGmLLa1vo';
  const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
  
  console.log('📡 Testing URL:', testUrl.replace(apiKey, apiKey.substring(0, 10) + '...'));
  
  return fetch(testUrl, { method: 'HEAD' })
    .then(response => {
      console.log('📡 Response status:', response.status);
      if (response.ok) {
        console.log('✅ API key appears valid');
        return true;
      } else {
        console.log('❌ API key invalid - Status:', response.status);
        return false;
      }
    })
    .catch(error => {
      console.log('❌ Network error:', error);
      return false;
    });
}

// Add to window for console testing
if (typeof window !== 'undefined') {
  window.testApiKeyDirectly = testApiKeyDirectly;
}