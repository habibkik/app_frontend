import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Paintbrush, Type, Layout, RotateCcw } from "lucide-react";
import type { LandingPageTheme } from "./types";
import { DEFAULT_LANDING_THEME, THEME_PRESETS, FONT_OPTIONS } from "./types";

interface Props {
  theme: LandingPageTheme;
  onChange: (theme: LandingPageTheme) => void;
}

export const LandingPageCustomizer: React.FC<Props> = ({ theme, onChange }) => {
  const update = (partial: Partial<LandingPageTheme>) => onChange({ ...theme, ...partial });

  return (
    <div className="space-y-4">
      {/* Presets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Paintbrush className="h-4 w-4" /> Quick Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => update(preset.theme)}
              >
                <span
                  className="h-3 w-3 rounded-full border border-border shrink-0"
                  style={{ background: preset.theme.primaryColor }}
                />
                {preset.name}
              </Button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange(DEFAULT_LANDING_THEME)}
            >
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Colors */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Paintbrush className="h-4 w-4" /> Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ColorPicker label="Primary" value={theme.primaryColor} onChange={(v) => update({ primaryColor: v })} />
            <ColorPicker label="Dark / Hero BG" value={theme.secondaryColor} onChange={(v) => update({ secondaryColor: v })} />
            <ColorPicker label="Accent" value={theme.accentColor} onChange={(v) => update({ accentColor: v })} />
            <ColorPicker label="Text" value={theme.textColor} onChange={(v) => update({ textColor: v })} />
            <ColorPicker label="Background" value={theme.bgColor} onChange={(v) => update({ bgColor: v })} />
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Type className="h-4 w-4" /> Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Heading Font</Label>
              <Select value={theme.headingFont} onValueChange={(v) => update({ headingFont: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      <span style={{ fontFamily: f.value }}>{f.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Body Font</Label>
              <Select value={theme.bodyFont} onValueChange={(v) => update({ bodyFont: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      <span style={{ fontFamily: f.value }}>{f.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-2 space-y-1">
              <p className="text-[10px] text-muted-foreground">Preview</p>
              <p className="text-lg font-bold" style={{ fontFamily: theme.headingFont }}>Heading Text</p>
              <p className="text-sm" style={{ fontFamily: theme.bodyFont }}>Body text looks like this paragraph.</p>
            </div>
          </CardContent>
        </Card>

        {/* Layout */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layout className="h-4 w-4" /> Layout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Page Style</Label>
              <Select value={theme.layout} onValueChange={(v: any) => update({ layout: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Border Radius</Label>
              <Select value={theme.borderRadius} onValueChange={(v: any) => update({ borderRadius: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sharp (0px)</SelectItem>
                  <SelectItem value="small">Small (4px)</SelectItem>
                  <SelectItem value="medium">Medium (8px)</SelectItem>
                  <SelectItem value="large">Rounded (16px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hero Style</Label>
              <Select value={theme.heroStyle} onValueChange={(v: any) => update({ heroStyle: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centered">Centered</SelectItem>
                  <SelectItem value="left-aligned">Left Aligned</SelectItem>
                  <SelectItem value="split">Split (Image Right)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Live color swatch */}
            <div className="pt-2 flex gap-1.5">
              {[theme.primaryColor, theme.secondaryColor, theme.accentColor, theme.textColor, theme.bgColor].map((c, i) => (
                <span
                  key={i}
                  className="h-6 w-6 rounded border border-border"
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Simple color picker sub-component
const ColorPicker: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <div className="flex items-center gap-2">
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 w-7 rounded border border-border cursor-pointer p-0"
    />
    <div className="flex-1">
      <Label className="text-xs">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 text-xs px-1 font-mono"
        maxLength={7}
      />
    </div>
  </div>
);
