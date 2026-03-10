import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WEBSITE_TEMPLATES, type WebsiteTemplate } from "./templates";
import { X, Check, Layers, Type, Palette, Layout } from "lucide-react";

interface TemplatePickerProps {
  onSelect: (template: WebsiteTemplate) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ onSelect }) => {
  const [preview, setPreview] = useState<WebsiteTemplate | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose a Template</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Pick a starting point for your website. You can fully customize it after.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        {WEBSITE_TEMPLATES.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="cursor-pointer group hover:border-primary/60 transition-all duration-300 hover:shadow-xl overflow-hidden"
              onClick={() => setPreview(template)}
            >
              <div className="h-44 relative overflow-hidden bg-muted/40">
                <img
                  src={template.previewImage}
                  alt={`${template.name} template preview`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                    Preview
                  </span>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground">{template.name}</h3>
                  <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Full-screen preview modal */}
      <AnimatePresence>
        {preview && (
          <TemplatePreviewModal
            template={preview}
            onClose={() => setPreview(null)}
            onSelect={() => {
              onSelect(preview);
              setPreview(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Preview Modal ───────────────────────────────────────────── */

interface PreviewModalProps {
  template: WebsiteTemplate;
  onClose: () => void;
  onSelect: () => void;
}

const blockLabel = (type: string) =>
  type
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const TemplatePreviewModal: React.FC<PreviewModalProps> = ({
  template,
  onClose,
  onSelect,
}) => {
  const enabledBlocks = template.blocks.filter((b) => b.enabled);
  const themeColors = [
    { label: "Primary", color: template.theme.primaryColor },
    { label: "Secondary", color: template.theme.secondaryColor },
    { label: "Accent", color: template.theme.accentColor },
    { label: "Background", color: template.theme.bgColor },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>

        <div className="flex-1 overflow-y-auto">
          {/* Hero preview image */}
          <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden">
            <img
              src={template.previewImage}
              alt={`${template.name} preview`}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="mb-2 text-xs">{template.category}</Badge>
              <h2 className="text-2xl font-bold text-white">{template.name}</h2>
              <p className="text-sm text-white/80 mt-1 max-w-xl">{template.description}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blocks included */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                Blocks Included
              </div>
              {enabledBlocks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Blank canvas — add blocks after selecting.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {enabledBlocks.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Check className="h-3 w-3 text-primary shrink-0" />
                      {blockLabel(b.type)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Color palette */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Palette className="h-4 w-4 text-primary" />
                Color Palette
              </div>
              <div className="flex flex-wrap gap-2">
                {themeColors.map((c) => (
                  <div key={c.label} className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-md border border-border shadow-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <div>
                      <p className="text-[10px] font-medium text-foreground leading-none">{c.label}</p>
                      <p className="text-[10px] text-muted-foreground">{c.color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography & Layout */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Type className="h-4 w-4 text-primary" />
                Typography & Layout
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium w-16">Heading</span>
                  <span className="truncate">{template.theme.headingFont.split(",")[0].replace(/'/g, "")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium w-16">Body</span>
                  <span className="truncate">{template.theme.bodyFont.split(",")[0].replace(/'/g, "")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layout className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="capitalize">{template.theme.layout} layout · {template.theme.heroStyle} hero · {template.theme.borderRadius} radius</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-border p-4 flex items-center justify-between bg-muted/30">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Back to Templates
          </Button>
          <Button size="sm" onClick={onSelect} className="gap-2">
            <Check className="h-4 w-4" />
            Use This Template
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
