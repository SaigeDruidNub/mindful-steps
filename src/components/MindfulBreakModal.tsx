"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Check, Eye, Wind, MessageCircle, User } from "lucide-react";
import { MindfulBreak } from "@/types";

interface MindfulBreakModalProps {
  break: MindfulBreak | null;
  onComplete: (photo?: string, note?: string) => void;
  onSkip: () => void;
  onPhotoCapture: () => void;
}

export function MindfulBreakModal({
  break: mindfulBreak,
  onComplete,
  onSkip,
  onPhotoCapture,
}: MindfulBreakModalProps) {
  if (!mindfulBreak) return null;

  const { prompt } = mindfulBreak;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Mindful Break</CardTitle>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prompt Type Badge */}
          <div className="flex justify-center">
            <Badge variant={getPromptVariant(prompt.type)}>
              {getPromptIcon(prompt.type)}
              <span className="ml-1">{prompt.type}</span>
            </Badge>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">
              {prompt.title}
            </h2>
            <p className="text-muted-foreground">{prompt.description}</p>
          </div>

          {/* Instruction */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-center">{prompt.instruction}</p>
          </div>

          {/* Photo Section */}
          {prompt.type === "photo" ? (
            <div className="space-y-3">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <span className="font-medium text-primary">
                    Photo Exercise
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Capture a moment that represents this prompt
                </p>
                <Button
                  onClick={onPhotoCapture}
                  className="w-full flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  <Camera className="w-5 h-5" />
                  Take Photo Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-5 h-5 text-accent" />
                  <span className="font-medium text-accent">
                    Optional Photo
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Want to capture this moment? Take a photo to remember your
                  mindful experience.
                </p>
                <Button
                  onClick={onPhotoCapture}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Camera className="w-4 h-4" />
                  Add Photo (Optional)
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onComplete()}
              className="flex-1 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Complete
            </Button>
            <Button onClick={onSkip} variant="outline" className="flex-1">
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getPromptVariant(type: string) {
  switch (type) {
    case "photo":
      return "default";
    case "sensory":
      return "secondary";
    case "breathing":
      return "outline";
    case "reflection":
      return "default";
    default:
      return "default";
  }
}

function getPromptIcon(type: string) {
  switch (type) {
    case "photo":
      return <Camera className="w-4 h-4" />;
    case "sensory":
      return <Eye className="w-4 h-4" />;
    case "breathing":
      return <Wind className="w-4 h-4" />;
    case "reflection":
      return <MessageCircle className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
}
