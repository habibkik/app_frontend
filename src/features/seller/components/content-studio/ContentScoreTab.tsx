import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Heart, Monitor, Shield, Lightbulb, FlaskConical, DollarSign } from "lucide-react";
import type { ContentScore } from "./types";

interface Props {
  score: ContentScore | null;
}

const ScoreBar = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) => {
  const color = value >= 16 ? "text-primary" : value >= 10 ? "text-yellow-600" : "text-destructive";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          {label}
        </span>
        <span className="font-medium">{value}/20</span>
      </div>
      <Progress value={(value / 20) * 100} className="h-2" />
    </div>
  );
};

export const ContentScoreTab: React.FC<Props> = ({ score }) => {
  if (!score) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Target className="h-12 w-12 mb-3" />
        <p className="text-sm">Generate your marketing kit to see content scores.</p>
      </div>
    );
  }

  const overallColor =
    score.overall >= 80 ? "text-primary" : score.overall >= 60 ? "text-yellow-600" : "text-destructive";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Content Score & Optimization</h3>

      {/* Overall Score */}
      <Card className="border-2">
        <CardContent className="flex items-center gap-6 py-6">
          <div className={`text-5xl font-bold ${overallColor}`}>{score.overall}</div>
          <div>
            <p className="font-semibold">Overall Content Score</p>
            <p className="text-sm text-muted-foreground">
              {score.overall >= 80
                ? "Excellent! Your content is well-optimized."
                : score.overall >= 60
                ? "Good, but there's room for improvement."
                : "Needs improvement. See suggestions below."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoreBar label="Headline Clarity" value={score.headlineClarity} icon={TrendingUp} />
          <ScoreBar label="CTA Strength" value={score.ctaStrength} icon={Target} />
          <ScoreBar label="Emotional Appeal" value={score.emotionalAppeal} icon={Heart} />
          <ScoreBar label="Platform Optimization" value={score.platformOptimization} icon={Monitor} />
          <ScoreBar label="Competitive Differentiation" value={score.competitiveDifferentiation} icon={Shield} />
        </CardContent>
      </Card>

      {/* Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              Competitor Differentiation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              Pricing Angle Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.pricingAngleSuggestions.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              CTA Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.ctaOptimizations.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FlaskConical className="h-4 w-4 text-primary" />
              A/B Testing Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.abTestSuggestions.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
