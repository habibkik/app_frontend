import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LandingPageTheme } from "../content-studio/types";
import { THEME_PRESETS, FONT_OPTIONS } from "../content-studio/types";

interface Props {
  theme: LandingPageTheme;
  onChange: (theme: LandingPageTheme) => void;
}

export const ThemeCustomizer: React.FC<Props> = ({ theme, onChange }) => {
  const update = (patch: Partial<LandingPageTheme>) => onChange({ ...theme, ...patch });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {THEME_PRESETS.map((p) => (
          <Button key={p.name} size="sm" variant="outline" className="h-7 text-xs" onClick={() => update(p.theme)}>
            <span className="w-3 h-3 rounded-full mr-1.5 border" style={{ background: p.theme.primaryColor }} />
            {p.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {([
          ["primaryColor", "Primary"],
          ["secondaryColor", "Secondary"],
          ["accentColor", "Accent"],
          ["textColor", "Text"],
          ["bgColor", "Background"],
        ] as const).map(([key, label]) => (
          <div key={key}>
            <Label className="text-xs">{label}</Label>
            <Input type="color" value={theme[key]} onChange={(e) => update({ [key]: e.target.value })} className="h-8 p-1 cursor-pointer" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Heading Font</Label>
          <Select value={theme.headingFont} onValueChange={(v) => update({ headingFont: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{FONT_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Body Font</Label>
          <Select value={theme.bodyFont} onValueChange={(v) => update({ bodyFont: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{FONT_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Layout</Label>
          <Select value={theme.layout} onValueChange={(v: any) => update({ layout: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="classic" className="text-xs">Classic</SelectItem>
              <SelectItem value="modern" className="text-xs">Modern</SelectItem>
              <SelectItem value="minimal" className="text-xs">Minimal</SelectItem>
              <SelectItem value="bold" className="text-xs">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Border Radius</Label>
          <Select value={theme.borderRadius} onValueChange={(v: any) => update({ borderRadius: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">None</SelectItem>
              <SelectItem value="small" className="text-xs">Small</SelectItem>
              <SelectItem value="medium" className="text-xs">Medium</SelectItem>
              <SelectItem value="large" className="text-xs">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
