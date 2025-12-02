'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { OAuthService } from '@/lib/oauthService';
import { setUserToken } from '@/config/api';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const provider = 'google'; // Only Google now

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      try {
        const result = await OAuthService.handleAuthCallback(code, provider);
        
        if (result.success) {
          setStatus('success');
          setMessage('Successfully authenticated! Redirecting...');
          
          // Store authentication data
          if (result.token) {
            setUserToken(result.token);
          }
          if (result.user) {
            localStorage.setItem('mindful-steps-user', JSON.stringify(result.user));
          }
          
          // Force a hard redirect to reinitialize the app state
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setStatus('error');
          setMessage(result.error || 'Authentication failed');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during authentication');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
              <h2 className="text-xl font-semibold">Authenticating...</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <h2 className="text-xl font-semibold text-green-600">Success!</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="w-12 h-12 mx-auto text-red-500" />
              <h2 className="text-xl font-semibold text-red-600">Authentication Failed</h2>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground">You will be redirected to the home page...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}