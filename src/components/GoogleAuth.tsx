"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setUserToken, getUserToken, clearUserToken } from "@/config/api";

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface GoogleAuthProps {
  onUserChange?: (user: User | null) => void;
}

export function GoogleAuth({ onUserChange }: GoogleAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Only run client-side code after component mounts
  useEffect(() => {
    setIsClient(true);

    const token = getUserToken();
    if (token) {
      // In a real app, you'd validate the token with your backend
      // For now, we'll just check if there's stored user data
      const storedUser = localStorage.getItem("mindful-steps-user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          onUserChange?.(parsedUser);
        } catch (error) {
          console.warn("Invalid stored user data:", error);
          clearUserToken();
        }
      }
    }
  }, []); // Remove onUserChange from dependencies

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      // Load Google Identity Services
      if (!window.google) {
        // Load Google GSI script if not already loaded
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => initializeGoogleSignIn();
        script.onerror = () => {
          console.error("Failed to load Google Identity Services");
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setIsLoading(false);
    }
  };

  const initializeGoogleSignIn = () => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id:
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "your-google-client-id.apps.googleusercontent.com",
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: false,
    });

    // Show the sign-in popup
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to button click
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { theme: "outline", size: "large" }
        );
      }
    });
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split(".")[1]));

      const userData: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      // Store user data and token
      localStorage.setItem("mindful-steps-user", JSON.stringify(userData));
      setUserToken(response.credential);

      setUser(userData);
      onUserChange?.(userData);
      setIsLoading(false);

      console.log("✅ User signed in:", userData);
    } catch (error) {
      console.error("Error handling Google response:", error);
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    clearUserToken();
    localStorage.removeItem("mindful-steps-user");
    setUser(null);
    onUserChange?.(null);

    // Revoke Google access
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user) {
    return (
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🔐 Sign In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Sign in to sync your data across devices and backup your mindful
            moments
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <div id="google-signin-button" className="hidden" />
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Your data stays private and secure
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Google types
declare global {
  interface Window {
    google?: any;
  }
}
