import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, FileText, Music, Subtitles, Clapperboard } from "lucide-react";

export const VideoTab: React.FC = () => {
  const videoSections = [
    { icon: Clapperboard, title: "Script", description: "AI-generated promotional script tailored to your product's unique selling points and competitive advantages." },
    { icon: FileText, title: "Storyboard", description: "Scene-by-scene visual storyboard with camera angles, transitions, and product focus shots." },
    { icon: Subtitles, title: "Voiceover & Subtitles", description: "Professional voiceover text with timed subtitles in multiple languages." },
    { icon: Music, title: "Background Music", description: "Mood-matched royalty-free music suggestions for different platforms and audiences." },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Video Generation</h3>
        <Badge variant="secondary" className="bg-accent text-accent-foreground">Coming Soon</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        AI-powered video generation using Seedance 2.0 will be available soon. Here's what will be generated:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videoSections.map((section) => (
          <Card key={section.title} className="border-dashed opacity-75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <section.icon className="h-4 w-4 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{section.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <Video className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Video API integration is planned for a future release
          </p>
          <p className="text-xs text-muted-foreground max-w-md text-center">
            When available, this will generate a 30-60 second promotional video with product shots, text overlays, transitions, and music — ready for social media publishing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
