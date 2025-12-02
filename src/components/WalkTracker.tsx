"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Target,
  TrendingUp,
  Calendar,
  Award,
  Play,
  Pause,
  Square,
  Footprints,
  Clock,
  RotateCcw,
  Settings,
  X,
  Camera,
  Map,
  Rocket,
  Trophy,
  Flame,
  Zap,
  ThumbsUp,
  Share2,
  Trash2,
  MapPin,
  FileText,
} from "lucide-react";
import { useStepCounter } from "@/hooks/useStepCounter";
import { useBadgeSystem } from "@/hooks/useBadgeSystem";
import { GalleryManager } from "@/lib/gallery";
import {
  getRandomPrompt,
  getRandomStepsInterval,
  SENSORY_PROMPTS,
} from "@/lib/prompts";
import { Photo } from "@/types/gallery";
import { MindfulBreak } from "@/types";
import { MindfulBreakModal } from "@/components/MindfulBreakModal";
import { NotificationManager } from "@/lib/notifications";
import { MapView } from "@/components/MapView";
import { VultrStorageService } from "@/lib/vultrStorage";

interface StepGoal {
  daily: number;
  weekly: number;
  monthly: number;
}

interface WalkStreak {
  current: number;
  longest: number;
  lastWalkDate: string;
}

export function WalkTracker() {
  // Show warning if not syncing to Vultr
  const [showLocalWarning, setShowLocalWarning] = useState(false);
  const badgeSystem = useBadgeSystem();

  const [stepGoals, setStepGoals] = useState<StepGoal>({
    daily: 5000,
    weekly: 35000,
    monthly: 150000,
  });
  const [streak, setStreak] = useState<WalkStreak>({
    current: 0,
    longest: 0,
    lastWalkDate: "",
  });
  const [activeWalk, setActiveWalk] = useState<{
    id: string;
    startTime: number;
    startSteps: number;
    isPaused: boolean;
    pausedTime?: number;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempGoals, setTempGoals] = useState<StepGoal>(stepGoals);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<MindfulBreak | null>(null);
  const [nextPromptAt, setNextPromptAt] = useState<number>(0);
  const [completedPrompts, setCompletedPrompts] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [isOnline, setIsOnline] = useState(true);

  const {
    stepData,
    isCounting,
    isSupported,
    startCounting,
    stopCounting,
    reset,
  } = useStepCounter();

  // Load saved goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem("stepGoals");
    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals);
        setStepGoals(parsed);
        setTempGoals(parsed);
      } catch (error) {
        console.error("Failed to load saved goals:", error);
      }
    }
  }, []);

  // Save goals to localStorage
  const saveGoals = useCallback(() => {
    localStorage.setItem("stepGoals", JSON.stringify(tempGoals));
    setStepGoals(tempGoals);
    setShowSettings(false);

    // Sync goals to Vultr if online
    if (isOnline) {
      VultrStorageService.saveGoals(tempGoals).catch((error) => {
        console.warn("⚠️ Failed to sync goals to cloud:", error);
      });
    }
  }, [tempGoals, isOnline]);

  const openSettings = () => {
    setTempGoals(stepGoals);
    setShowSettings(true);
  };

  const cancelSettings = () => {
    setTempGoals(stepGoals);
    setShowSettings(false);
  };

  const handlePhotoCapture = async () => {
    setShowCameraModal(true);
    console.log("📸 Opening camera modal...");
  };

  const startCamera = async () => {
    try {
      console.log("📷 Requesting camera access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log("✅ Camera access granted");
      setCameraStream(stream);

      // Auto-start video when modal opens
      setTimeout(() => {
        const video = document.getElementById(
          "camera-video"
        ) as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      }, 100);
    } catch (error) {
      console.error("❌ Camera start failed:", error);
    }
  };

  const capturePhotoFromStream = async (stream: MediaStream) => {
    const photoPrompt = {
      id: "prompt-" + Date.now(),
      type: "photo" as const,
      title: "Mindful Moment",
      description: "Capture something beautiful from your walk",
      instruction: "Take a photo of something that catches your eye",
    };

    try {
      console.log("📷 Setting up video capture...");

      const video = document.getElementById("camera-video") as HTMLVideoElement;
      const canvas = document.getElementById(
        "camera-canvas"
      ) as HTMLCanvasElement;

      if (!video || !canvas) {
        throw new Error("Camera elements not found");
      }

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Failed to get canvas context");
      }

      console.log("📹 Canvas set up, capturing from video...");

      // Set canvas dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const imageUrl = canvas.toDataURL("image/jpeg", 0.8);

      // Test if we got actual image data
      if (imageUrl === "data:," || imageUrl.length < 1000) {
        throw new Error("Canvas returned empty image");
      }

      console.log("📸 Image captured, data URL length:", imageUrl.length);

      // Save the photo
      GalleryManager.savePhoto({
        imageUrl: imageUrl,
        promptId: photoPrompt.id,
        promptTitle: photoPrompt.title,
        promptType: photoPrompt.type,
        note: `Real camera photo from ${new Date().toLocaleDateString()} - ${currentWalkSteps} steps into walk`,
        location: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      });

      // Update badge system
      badgeSystem.addPhoto();

      console.log("📸 Real photo captured and saved to gallery!");
      closeCameraModal();
    } catch (error) {
      console.error("❌ Photo capture failed:", error);
    }
  };

  const closeCameraModal = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const handlePromptComplete = (photoUrl?: string, note?: string) => {
    if (currentPrompt) {
      setCompletedPrompts((prev) => [...prev, currentPrompt.prompt.id]);

      // Update badge system for mindful break
      badgeSystem.addMindfulBreak();

      // If a photo was captured, save it with prompt context
      if (photoUrl) {
        const photo = GalleryManager.savePhoto({
          imageUrl: photoUrl,
          promptId: currentPrompt.prompt.id,
          promptTitle: currentPrompt.prompt.title,
          promptType: currentPrompt.prompt.type,
          note:
            note ||
            `Mindful moment: ${currentPrompt.prompt.title} - ${currentWalkSteps} steps into walk`,
          location: {
            latitude: 40.7128,
            longitude: -74.006,
          },
        });

        // Update badge system
        badgeSystem.addPhoto();

        // Sync photo to Vultr if online
        if (photo && isOnline) {
          VultrStorageService.savePhoto(photo).catch((error) => {
            console.warn("⚠️ Failed to sync photo to cloud:", error);
          });
        }
      }

      setCurrentPrompt(null);
    }
  };

  const handlePromptSkip = () => {
    if (currentPrompt) {
      setCurrentPrompt(null);
    }
  };

  const handlePromptPhotoCapture = () => {
    // Close prompt modal and open camera
    setCurrentPrompt(null);
    setShowCameraModal(true);
  };

  // Only run client-side code after component mounts
  useEffect(() => {
    setIsClient(true);
    // Initialize notification system after user interaction
    const handleUserInteraction = () => {
      NotificationManager.initAudio();
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);
  }, []);

  // Check for mindful moment prompts during walks
  useEffect(() => {
    if (!activeWalk || !isClient) return;

    const currentSteps = stepData.steps;
    const walkSteps = currentSteps - activeWalk.startSteps;

    // Check if we should trigger a prompt
    if (walkSteps >= nextPromptAt && nextPromptAt > 0) {
      // Don't trigger prompts that were recently completed
      const availablePrompts = SENSORY_PROMPTS.filter(
        (p) => !completedPrompts.includes(p.id)
      );

      if (availablePrompts.length > 0) {
        const randomPrompt =
          availablePrompts[Math.floor(Math.random() * availablePrompts.length)];

        // Play notification sound and vibrate
        NotificationManager.notifyMindfulMoment();

        setCurrentPrompt({
          id: `break-${Date.now()}`,
          timestamp: Date.now(),
          stepsTriggered: walkSteps,
          prompt: randomPrompt,
          completed: false,
        });

        // Set next prompt interval (50-1500 steps)
        const nextInterval = getRandomStepsInterval(50, 1500);
        setNextPromptAt(walkSteps + nextInterval);
      }
    } else if (nextPromptAt === 0 && walkSteps > 10) {
      // Set initial prompt interval after walk starts
      const initialInterval = getRandomStepsInterval(50, 1500);
      setNextPromptAt(walkSteps + initialInterval);
    }
  }, [stepData.steps, activeWalk, nextPromptAt, isClient, completedPrompts]);

  // Reset prompt state when walk ends
  useEffect(() => {
    if (!activeWalk) {
      setCurrentPrompt(null);
      setNextPromptAt(0);
    }
  }, [activeWalk]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && syncStatus === "idle") {
      autoSyncData();
    }
  }, [isOnline]);

  // Listen for API availability and trigger sync
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (!isOnline) return;
    interval = setInterval(async () => {
      const available = await VultrStorageService.isApiAvailable();
      if (available) {
        VultrStorageService.syncQueuedData();
        setShowLocalWarning(false);
        if (interval) clearInterval(interval);
      } else {
        setShowLocalWarning(true);
      }
    }, 10000); // check every 10s
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline]);

  // Sync data to Vultr storage
  const syncDataToVultr = async () => {
    if (!isOnline) {
      console.log("📵 Offline - skipping sync");
      return;
    }

    setSyncStatus("syncing");
    try {
      console.log("🔄 Syncing data to Vultr storage...");

      // Sync goals
      if (stepGoals) {
        await VultrStorageService.saveGoals(stepGoals);
        console.log("✅ Goals synced to cloud");
      }

      // Sync photos if any exist
      const photos = GalleryManager.getPhotos();
      for (const photo of photos) {
        try {
          await VultrStorageService.savePhoto(photo);
        } catch (error) {
          console.warn("⚠️ Failed to sync photo:", photo.id, error);
        }
      }

      console.log("✅ Data sync completed");
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      console.error("❌ Sync failed:", error);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  // Auto-sync function
  const autoSyncData = async () => {
    try {
      const isApiAvailable = await VultrStorageService.isApiAvailable();
      if (isApiAvailable) {
        await syncDataToVultr();
      } else {
        console.log("🌐 Vultr API not available - using localStorage only");
      }
    } catch (error) {
      console.log("⚠️ Auto-sync failed, continuing with localStorage");
    }
  };

  // Manual sync trigger
  const handleManualSync = () => {
    syncDataToVultr();
  };

  const galleryStats = isClient
    ? GalleryManager.getGalleryStats()
    : { totalPhotos: 0, uniqueWalks: 0, photosToday: 0 };
  const galleryPhotos = isClient ? GalleryManager.getPhotos() : [];

  const handleDeletePhoto = () => {
    if (photoToDelete) {
      GalleryManager.deletePhoto(photoToDelete.id);
      setPhotoToDelete(null);
      setShowDeleteConfirm(false);
      setSelectedPhoto(null);
    }
  };

  const handleSharePhoto = async (photo: Photo) => {
    console.log("📤 Attempting to share photo...");

    try {
      // Try to convert data URL to blob for better sharing
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "mindful-walk-photo.jpg", {
        type: "image/jpeg",
      });

      // Try native Web Share API first (mobile devices)
      if (navigator.share && navigator.canShare) {
        console.log("📱 Checking native share compatibility...");

        if (navigator.canShare({ files: [file] })) {
          console.log("📱 Using native share API with file");

          try {
            await navigator.share({
              title: "Mindful Steps Photo",
              text: photo.note || "Check out my mindful moment from my walk!",
              files: [file],
            });
            console.log("✅ Native share successful");
            return;
          } catch (shareError) {
            console.log("⚠️ Native share failed, trying fallback:", shareError);
          }
        }
      }

      // Fallback: Copy image to clipboard (as URL)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        console.log("📋 Copying to clipboard");

        await navigator.clipboard.writeText(photo.imageUrl);
        console.log("✅ Copied image URL to clipboard");

        // Show feedback to user
        alert(
          "Photo link copied to clipboard! You can share this link with others."
        );
      } else {
        // Last resort: Open image in new tab
        console.log("🌐 Opening in new tab");
        window.open(photo.imageUrl, "_blank");
      }
    } catch (error) {
      console.error("❌ Share failed:", error);

      // Simple fallback
      try {
        await navigator.clipboard.writeText(photo.imageUrl);
        alert("Photo link copied to clipboard!");
      } catch (clipboardError) {
        alert("Share failed. You can right-click the photo to save it.");
      }
    }
  };

  // Calculate mock statistics
  const todayStats = {
    totalSteps: stepData.steps,
    totalDistance: stepData.distance,
    totalDuration: Math.floor(stepData.steps / 100),
    walksCompleted: activeWalk ? 1 : 0,
    goalProgress: (stepData.steps / stepGoals.daily) * 100,
  };

  const weeklyStats = {
    totalSteps: stepData.steps * 2, // Mock
    totalDistance: stepData.distance * 2,
    totalDuration: Math.floor(stepData.steps / 50),
    walksCompleted: 2, // Mock
    goalProgress: ((stepData.steps * 2) / stepGoals.weekly) * 100,
  };

  const monthlyStats = {
    totalSteps: stepData.steps * 7, // Mock
    totalDistance: stepData.distance * 7,
    totalDuration: Math.floor(stepData.steps / 25),
    walksCompleted: 3, // Mock
    goalProgress: ((stepData.steps * 7) / stepGoals.monthly) * 100,
  };

  const handleStartWalk = () => {
    const now = Date.now();
    const walk = {
      id: `walk-${now}`,
      startTime: now,
      startSteps: stepData.steps,
      isPaused: false,
    };
    setActiveWalk(walk);
    if (!isCounting) {
      startCounting();
    }
  };

  const handlePauseWalk = () => {
    if (activeWalk) {
      if (activeWalk.isPaused) {
        // Resume
        setActiveWalk({
          ...activeWalk,
          isPaused: false,
          pausedTime: undefined,
        });
        startCounting();
      } else {
        // Pause
        setActiveWalk({
          ...activeWalk,
          isPaused: true,
          pausedTime: Date.now(),
        });
        stopCounting();
      }
    }
  };

  const handleEndWalk = () => {
    if (activeWalk) {
      const today = new Date().toISOString().split("T")[0];
      const endTime = Date.now();
      const duration = Math.floor((endTime - activeWalk.startTime) / 60000); // minutes
      const stepsWalked = stepData.steps - activeWalk.startSteps;
      const distanceWalked = stepData.distance;

      // Build walk log object
      const walkLog = {
        id: activeWalk.id,
        date: today,
        startTime: activeWalk.startTime,
        endTime,
        steps: stepsWalked,
        distance: distanceWalked,
        duration,
        mindfulBreaksCompleted: completedPrompts.length,
        // Add more fields as needed (e.g., startLocation, endLocation, notes)
      };

      // Save to Vultr Object Storage
      VultrStorageService.saveLog(walkLog).catch((error) => {
        console.error("Failed to save walk log to Vultr:", error);
      });

      // Update streak logic
      if (today === streak.lastWalkDate) {
        // Same day, no change
      } else if (
        today === new Date(Date.now() - 86400000).toISOString().split("T")[0] ||
        today === new Date().toISOString().split("T")[0]
      ) {
        setStreak((prev) => ({
          ...prev,
          current: prev.current + 1,
          longest: prev.current > prev.longest ? prev.current : prev.longest,
        }));
      } else {
        setStreak({ current: 1, longest: streak.longest, lastWalkDate: today });
      }

      badgeSystem.addWalk();
      badgeSystem.calculateAndUpdateStreak();

      setActiveWalk(null);
    }
  };

  const getGoalColor = (progress: number) => {
    if (progress >= 100) return "text-primary";
    if (progress >= 75) return "text-primary";
    if (progress >= 50) return "text-primary";
    return "text-gray-600";
  };

  const getGoalMessage = (progress: number) => {
    if (progress >= 100)
      return { icon: Trophy, text: "Goal achieved!", color: "text-primary" };
    if (progress >= 75)
      return { icon: Flame, text: "Almost there!", color: "text-primary" };
    if (progress >= 50)
      return { icon: Zap, text: "Keep going!", color: "text-primary" };
    if (progress >= 25)
      return { icon: ThumbsUp, text: "Good start!", color: "text-primary" };
    return { icon: Rocket, text: "Let's begin!", color: "text-primary" };
  };

  const formatStreakMessage = (current: number, longest: number) => {
    if (current === 0) return "Start your streak today!";
    if (current === 1) return "1 day streak!";
    if (current === longest && current > 1)
      return `Personal best: ${current} days!`;
    return `${current} day streak!`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPace = (paceMinutes: number): string => {
    const minutes = Math.floor(paceMinutes);
    const seconds = Math.round((paceMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
  };

  const currentWalkDuration =
    activeWalk && !activeWalk.isPaused
      ? Math.floor((Date.now() - activeWalk.startTime) / 60000)
      : activeWalk && activeWalk.pausedTime
      ? Math.floor((activeWalk.pausedTime - activeWalk.startTime) / 60000)
      : 0;

  const currentWalkSteps = activeWalk
    ? stepData.steps - activeWalk.startSteps
    : 0;

  return (
    <div className="space-y-4">
      {showLocalWarning && (
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative flex items-center justify-between"
          role="alert"
        >
          <div>
            <strong className="font-bold">Warning:</strong>
            <span className="block sm:inline">
              {" "}
              Data is only saved locally and will not sync to the cloud until
              the Vultr API is available.
            </span>
          </div>
          <button
            type="button"
            className="ml-4 text-yellow-800 hover:text-yellow-600 focus:outline-none"
            aria-label="Close warning"
            onClick={() => setShowLocalWarning(false)}
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20">
              <path d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" />
            </svg>
          </button>
        </div>
      )}
      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Capture Mindful Moment
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeCameraModal}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!cameraStream ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Start Your Camera
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Allow camera access to capture mindful moments during your
                      walk
                    </p>
                  </div>
                  <Button onClick={startCamera} size="lg" className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className="relative bg-black rounded-lg overflow-hidden"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <video
                      id="camera-video"
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                  </div>

                  <canvas id="camera-canvas" className="hidden" />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        console.log("📸 Capture button clicked!");
                        if (cameraStream) {
                          capturePhotoFromStream(cameraStream);
                        } else {
                          console.log("❌ No camera stream available");
                        }
                      }}
                      size="lg"
                      className="flex-1"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button
                      onClick={closeCameraModal}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Your Mindful Photos ({galleryPhotos.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGalleryModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative overflow-hidden rounded-lg border cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.note || "Walk photo"}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="p-3 bg-background">
                        <p className="text-sm font-medium truncate">
                          {photo.promptTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(photo.timestamp).toLocaleDateString()} •{" "}
                          {new Date(photo.timestamp).toLocaleTimeString()}
                        </p>
                        {photo.note && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {photo.note}
                          </p>
                        )}
                      </div>
                      {/* Quick Actions Overlay */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSharePhoto(photo);
                          }}
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoToDelete(photo);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a walk and capture some mindful moments!
                  </p>
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setShowGalleryModal(false)}
                  className="px-6"
                >
                  Close Gallery
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selected Photo View Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[60]">
          <div className="relative max-w-4xl w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 z-10 h-8 w-8 p-0 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="bg-background rounded-lg overflow-hidden">
              <div className="relative">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.note || "Walk photo"}
                  className="w-full max-h-[70vh] object-contain"
                />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {selectedPhoto.promptTitle}
                </h3>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedPhoto.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(selectedPhoto.timestamp).toLocaleTimeString()}
                  </p>
                  {selectedPhoto.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {`${selectedPhoto.location.latitude.toFixed(
                        4
                      )}, ${selectedPhoto.location.longitude.toFixed(4)}`}
                    </p>
                  )}
                  {selectedPhoto.note && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {selectedPhoto.note}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSharePhoto(selectedPhoto)}
                    variant="outline"
                    className="flex-1"
                  >
                    Share Photo
                  </Button>
                  <Button
                    onClick={() => {
                      setPhotoToDelete(selectedPhoto);
                      setShowDeleteConfirm(true);
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    Delete Photo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && photoToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Delete Photo?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this photo? This action cannot
                be undone.
              </p>

              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={photoToDelete.imageUrl}
                  alt="Photo to delete"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setPhotoToDelete(null);
                    setShowDeleteConfirm(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeletePhoto}
                  variant="destructive"
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mindful Break Modal */}
      {currentPrompt && (
        <MindfulBreakModal
          break={currentPrompt}
          onComplete={(photoUrl?: string, note?: string) =>
            handlePromptComplete(photoUrl, note)
          }
          onSkip={handlePromptSkip}
          onPhotoCapture={handlePromptPhotoCapture}
        />
      )}

      {/* Active Walk Display */}
      <Card className={`${activeWalk ? "border-accent border-2" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Footprints className="w-5 h-5 text-primary" />
              Step Counter
              {activeWalk && (
                <Badge variant="default" className="ml-2 bg-accent">
                  Active
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Session Display */}
          <div className="text-center py-6">
            <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
              {currentWalkSteps.toLocaleString()}
            </div>
            <div className="text-lg font-semibold text-foreground">
              {currentWalkDuration}min
            </div>
            <div className="text-sm text-muted-foreground">steps this walk</div>
            {activeWalk && !activeWalk.isPaused && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  Recording...
                </span>
              </div>
            )}
            {activeWalk && activeWalk.isPaused && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm text-muted-foreground">Paused</span>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            {!activeWalk ? (
              <Button
                onClick={handleStartWalk}
                size="lg"
                className="flex items-center justify-center gap-2 px-3 sm:px-4"
              >
                <Play className="w-5 h-5" />
                Start Walk
              </Button>
            ) : (
              <Button
                onClick={handlePauseWalk}
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 px-3 sm:px-4"
              >
                {activeWalk.isPaused ? (
                  <>
                    <Play className="w-5 h-5" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={handleEndWalk}
              variant={activeWalk ? "destructive" : "outline"}
              size="lg"
              disabled={!activeWalk}
              className="flex items-center justify-center gap-2 px-3 sm:px-4"
            >
              <Square className="w-5 h-5" />
              End Walk
            </Button>

            <Button
              onClick={reset}
              variant="ghost"
              size="lg"
              disabled={!!activeWalk}
              className="flex items-center justify-center gap-2 px-3 sm:px-4"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </Button>
          </div>

          {/* Current Walk Stats */}
          {activeWalk && (
            <div className="space-y-3 text-center p-4 bg-muted/50 rounded-lg border">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Current Walk Stats
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-lg font-semibold text-primary">
                    {currentWalkSteps}
                  </div>
                  <div className="text-xs text-muted-foreground">steps</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {currentWalkDuration}min
                  </div>
                  <div className="text-xs text-muted-foreground">duration</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Pace: ~{formatPace(currentWalkDuration / currentWalkSteps)} per
                step
              </div>
            </div>
          )}

          {/* Photo Capture Button */}
          {activeWalk && (
            <div className="flex justify-center">
              <Button
                onClick={handlePhotoCapture}
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 px-3 sm:px-4"
              >
                <Camera className="w-5 h-5" />
                Capture Moment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map View */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Map View
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className="text-xs"
            >
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
          </div>
        </CardHeader>
        {showMap && (
          <CardContent className="p-0">
            <div className="h-64 overflow-y-auto">
              <MapView
                isActive={showMap}
                onLocationUpdate={(location) => {
                  console.log("📍 Location updated:", location);
                }}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Gallery Button */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Photo Gallery
            </CardTitle>
            <Button
              onClick={() => setShowGalleryModal(true)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              View Photos ({galleryStats.totalPhotos})
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Daily Goal */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Daily Goal
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={openSettings}
                className="h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className={getGoalColor(todayStats.goalProgress)}>
                {Math.round(todayStats.goalProgress)}%
              </span>
            </div>
            <Progress
              value={Math.min(todayStats.goalProgress, 100)}
              className="h-2"
            />
            <div className="text-center text-sm font-medium flex items-center justify-center gap-2">
              {(() => {
                const message = getGoalMessage(todayStats.goalProgress);
                const Icon = message.icon;
                return (
                  <>
                    <Icon className={`w-4 h-4 ${message.color}`} />
                    <span className={message.color}>{message.text}</span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded p-2">
              <div className="text-lg font-semibold text-primary">
                {todayStats.walksCompleted}
              </div>
              <div className="text-xs text-muted-foreground">Walks</div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-lg font-semibold text-foreground">
                {todayStats.totalDistance.toFixed(1)}km
              </div>
              <div className="text-xs text-muted-foreground">Distance</div>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <div className="text-lg font-semibold text-foreground">
                {formatDuration(todayStats.totalDuration)}
              </div>
              <div className="text-xs text-muted-foreground">Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Walking Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">
              {streak.current}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatStreakMessage(streak.current, streak.longest)}
            </div>
            {streak.longest > 0 && streak.current < streak.longest && (
              <div className="text-xs text-muted-foreground">
                Best: {streak.longest} days
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly & Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{weeklyStats.totalSteps.toLocaleString()} steps</span>
                <span className={getGoalColor(weeklyStats.goalProgress)}>
                  {Math.round(weeklyStats.goalProgress)}%
                </span>
              </div>
              <Progress
                value={Math.min(weeklyStats.goalProgress, 100)}
                className="h-1"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {weeklyStats.walksCompleted} walks •{" "}
              {weeklyStats.totalDistance.toFixed(1)}km
            </div>
          </CardContent>
        </Card>

        {/* Monthly */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{monthlyStats.totalSteps.toLocaleString()} steps</span>
                <span className={getGoalColor(monthlyStats.goalProgress)}>
                  {Math.round(monthlyStats.goalProgress)}%
                </span>
              </div>
              <Progress
                value={Math.min(monthlyStats.goalProgress, 100)}
                className="h-1"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {monthlyStats.walksCompleted} walks •{" "}
              {monthlyStats.totalDistance.toFixed(1)}km
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Step Goals Settings
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelSettings}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="daily">Daily Step Goal</Label>
                <Input
                  id="daily"
                  type="number"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={tempGoals.daily}
                  onChange={(e) =>
                    setTempGoals((prev) => ({
                      ...prev,
                      daily: parseInt(e.target.value) || 5000,
                    }))
                  }
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekly">Weekly Step Goal</Label>
                <Input
                  id="weekly"
                  type="number"
                  min="5000"
                  max="350000"
                  step="5000"
                  value={tempGoals.weekly}
                  onChange={(e) =>
                    setTempGoals((prev) => ({
                      ...prev,
                      weekly: parseInt(e.target.value) || 35000,
                    }))
                  }
                  placeholder="35000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly">Monthly Step Goal</Label>
                <Input
                  id="monthly"
                  type="number"
                  min="10000"
                  max="1500000"
                  step="10000"
                  value={tempGoals.monthly}
                  onChange={(e) =>
                    setTempGoals((prev) => ({
                      ...prev,
                      monthly: parseInt(e.target.value) || 150000,
                    }))
                  }
                  placeholder="150000"
                />
              </div>

              <div className="bg-muted/50 rounded p-3 text-sm">
                <p className="font-medium mb-1">Recommended Goals:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Beginner: 5,000 - 7,000 steps daily</li>
                  <li>• Intermediate: 8,000 - 10,000 steps daily</li>
                  <li>• Advanced: 12,000+ steps daily</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={cancelSettings}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={saveGoals} className="flex-1">
                  Save Goals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
