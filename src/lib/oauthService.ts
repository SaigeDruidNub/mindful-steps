import { API_CONFIG, setUserToken, clearUserToken, getUserToken } from '@/config/api';

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'apple';
  createdAt: string;
  lastLogin: string;
}

// Auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export class OAuthService {
  private static readonly REDIRECT_URI = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`;
  
  // Google OAuth
  static initiateGoogleLogin(): void {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', API_CONFIG.GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', this.REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    
    window.location.href = authUrl.toString();
  }

  // Apple Sign In (removed - Google only)
  // static initiateAppleLogin(): void {
  //   // Apple Sign In requires their JS SDK
  //   // This is a simplified version - in production you'd use Apple's SDK
  //   if (typeof (window as any).AppleID !== 'undefined') {
  //     (window as any).AppleID.auth.init({
  //       clientId: API_CONFIG.APPLE_CLIENT_ID,
  //       scope: 'name email',
  //       redirectURI: this.REDIRECT_URI,
  //       usePopup: true,
  //     });
  //     
  //     (window as any).AppleID.auth.signIn();
  //   } else {
  //     console.error('Apple Sign In SDK not loaded');
  //   }
  // }

  // Handle OAuth callback (Google only)
  static async handleAuthCallback(code: string, provider: 'google'): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      console.log('Attempting OAuth callback to:', API_CONFIG.API_BASE_URL);
      console.log('With code:', code ? 'present' : 'missing');
      
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirectUri: this.REDIRECT_URI,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.token && data.user) {
        setUserToken(data.token);
        return { success: true, user: data.user };
      } else {
        throw new Error('Invalid authentication response');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  // Get current user profile
  static async getCurrentUser(): Promise<UserProfile | null> {
    const token = getUserToken();
    if (!token) return null;

    // For now, just check localStorage for user data
    // This avoids API calls during initial auth check
    try {
      const userStr = localStorage.getItem('mindful-steps-user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Failed to get user from localStorage:', error);
      return null;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    const token = getUserToken();
    if (!token) return;

    try {
      await fetch(`${API_CONFIG.API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearUserToken();
    }
  }

  // Refresh token
  static async refreshToken(): Promise<boolean> {
    const token = getUserToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserToken(data.token);
        return true;
      } else {
        clearUserToken();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearUserToken();
      return false;
    }
  }
}