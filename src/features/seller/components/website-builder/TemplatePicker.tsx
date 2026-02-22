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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        {WEBSITE_TEMPLATES.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer group hover:border-primary/60 transition-all duration-300 hover:shadow-lg overflow-hidden"
              onClick={() => onSelect(template)}
            >
              <div className="h-40 flex items-center justify-center bg-muted/40 group-hover:bg-primary/5 transition-colors relative overflow-hidden">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                  {template.thumbnail}
                </span>
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
