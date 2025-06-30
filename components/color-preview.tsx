"use client";

import { useSystemSettings } from "@/contexts/system-settings-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ColorPreview() {
  const { settings } = useSystemSettings();

  if (!settings) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Color Preview</CardTitle>
        <CardDescription>How your colors will appear with proper contrast</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Primary Color</h4>
          <div className="flex items-center gap-2">
            <div 
              className="w-12 h-12 rounded-lg border flex items-center justify-center text-sm font-medium"
              style={{ 
                backgroundColor: settings.primaryColor,
                color: getContrastColor(settings.primaryColor)
              }}
            >
              Text
            </div>
            <div className="flex-1">
              <div className="text-sm font-mono">{settings.primaryColor}</div>
              <div className="text-xs text-muted-foreground">
                Contrast: {getContrastColor(settings.primaryColor)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Secondary Color</h4>
          <div className="flex items-center gap-2">
            <div 
              className="w-12 h-12 rounded-lg border flex items-center justify-center text-sm font-medium"
              style={{ 
                backgroundColor: settings.secondaryColor,
                color: getContrastColor(settings.secondaryColor)
              }}
            >
              Text
            </div>
            <div className="flex-1">
              <div className="text-sm font-mono">{settings.secondaryColor}</div>
              <div className="text-xs text-muted-foreground">
                Contrast: {getContrastColor(settings.secondaryColor)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Button Preview</h4>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: settings.primaryColor,
                color: getContrastColor(settings.primaryColor)
              }}
            >
              Primary Button
            </button>
            <button 
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: settings.secondaryColor,
                color: getContrastColor(settings.secondaryColor)
              }}
            >
              Secondary
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate contrast color
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
} 