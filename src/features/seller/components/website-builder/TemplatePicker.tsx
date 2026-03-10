import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WEBSITE_TEMPLATES, type WebsiteTemplate } from "./templates";

interface TemplatePickerProps {
  onSelect: (template: WebsiteTemplate) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ onSelect }) => {
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
              onClick={() => onSelect(template)}
            >
              <div className="h-44 relative overflow-hidden bg-muted/40">
                <img
                  src={template.previewImage}
                  alt={`${template.name} template preview`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
    </div>
  );
};
