"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`size-8 rounded-lg flex items-center justify-center ${className ?? ""}`}
      >
        <span className="size-4 opacity-0" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      variant="ghost"
      size="sm"
      title={`Switch to ${isDark ? "light" : "dark"} mode (Hotkey: D)`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-muted-foreground transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
}
