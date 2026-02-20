import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Paintbrush, Type, Layout, RotateCcw, Save, FolderOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { LandingPageTheme } from "./types";
import { DEFAULT_LANDING_THEME, THEME_PRESETS, FONT_OPTIONS } from "./types";

interface SavedTheme {
  id: string;
  name: string;
  theme_json: LandingPageTheme;
  created_at: string;
}

interface Props {
  theme: LandingPageTheme;
  onChange: (theme: LandingPageTheme) => void;
}

export const LandingPageCustomizer: React.FC<Props> = ({ theme, onChange }) => {
  const update = (partial: Partial<LandingPageTheme>) => onChange({ ...theme, ...partial });

  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);

  // Load saved themes on mount
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("landing_page_themes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setSavedThemes(data.map((d: any) => ({ ...d, theme_json: d.theme_json as LandingPageTheme })));
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("landing_page_themes")
        .insert({ user_id: user.id, name: saveName.trim(), theme_json: theme as any })
        .select()
        .single();
      if (error) throw error;
      setSavedThemes((prev) => [{ ...data, theme_json: data.theme_json as unknown as LandingPageTheme }, ...prev]);
      toast.success(`Theme "${saveName}" saved`);
      setSaveName("");
      setShowSaveDialog(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("landing_page_themes").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete theme");
      return;
    }
    setSavedThemes((prev) => prev.filter((t) => t.id !== id));
    toast.success("Theme deleted");
  };

  const handleLoad = (t: SavedTheme) => {
    onChange(t.theme_json);
    setShowLoadDialog(false);
    toast.success(`Theme "${t.name}" applied`);
  };

  return (
    <div className="space-y-4">
      {/* Presets + Save/Load */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Paintbrush className="h-4 w-4" /> Quick Presets
            </span>
            <span className="flex gap-1.5">
              <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(true)}>
                <Save className="h-3 w-3 mr-1" /> Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLoadDialog(true)}
                disabled={savedThemes.length === 0}
              >
                <FolderOpen className="h-3 w-3 mr-1" /> Load{savedThemes.length > 0 ? ` (${savedThemes.length})` : ""}
              </Button>
            </span>
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

      {/* Save Theme Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Theme Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="e.g. My Brand Theme"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div className="flex gap-1.5">
              {[theme.primaryColor, theme.secondaryColor, theme.accentColor, theme.textColor, theme.bgColor].map((c, i) => (
                <span key={i} className="h-8 w-8 rounded border border-border" style={{ background: c }} title={c} />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !saveName.trim()}>
                {saving ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Theme Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="sm:max-w-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Theme Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {savedThemes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No saved themes yet.</p>
            ) : (
              savedThemes.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleLoad(t)}
                >
                  <div className="flex gap-1">
                    {[t.theme_json.primaryColor, t.theme_json.secondaryColor, t.theme_json.accentColor].map((c, i) => (
                      <span key={i} className="h-5 w-5 rounded-full border border-border" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.theme_json.layout} · {t.theme_json.heroStyle}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
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
