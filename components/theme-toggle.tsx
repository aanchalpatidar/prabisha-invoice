"use client";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      className="p-2 rounded bg-gray-200 hover:bg-gray-300"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle light/dark mode"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
} 