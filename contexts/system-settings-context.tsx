"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface SystemSettings {
  id: string;
  organizationId: string;
  siteTitle: string;
  siteDescription: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  footerText?: string;
  createdAt: string;
  updatedAt: string;
}

interface SystemSettingsContextType {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/system-settings');
      if (!response.ok) {
        throw new Error('Failed to fetch system settings');
      }
      
      const data = await response.json();
      setSettings(data);
      
      // Apply CSS custom properties for colors
      if (data.primaryColor || data.secondaryColor) {
        const root = document.documentElement;
        if (data.primaryColor) {
          root.style.setProperty('--primary', data.primaryColor);
          root.style.setProperty('--primary-foreground', getContrastColor(data.primaryColor));
        }
        if (data.secondaryColor) {
          root.style.setProperty('--secondary', data.secondaryColor);
          root.style.setProperty('--secondary-foreground', getContrastColor(data.secondaryColor));
        }
      }
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  // Improved function to determine contrast color based on background color
  const getContrastColor = (hexColor: string): string => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance using WCAG formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Use a threshold of 0.5 for better readability
    // For light colors (luminance > 0.5), use dark text
    // For dark colors (luminance <= 0.5), use light text
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Function to get CSS custom property with fallback
  const getCSSVariable = (variable: string, fallback: string): string => {
    if (typeof document !== 'undefined') {
      const value = getComputedStyle(document.documentElement).getPropertyValue(variable);
      return value || fallback;
    }
    return fallback;
  };

  useEffect(() => {
    fetchSettings();
  }, [session?.user?.id]);

  const value = {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
} 