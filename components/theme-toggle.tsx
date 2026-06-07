'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const changeTheme = (newTheme: 'light' | 'dark', target: HTMLElement) => {
    if (theme === newTheme) return;

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: newTheme === 'dark' ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-in-out',
          pseudoElement: newTheme === 'dark'
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        }
      );
    });
  };

  const toggleTheme = (target: HTMLElement) => {
    changeTheme(theme === 'dark' ? 'light' : 'dark', target);
  };

  const handleThemeButtonClick = (selectedTheme: 'light' | 'dark', target: HTMLElement) => {
    if (theme === selectedTheme) {
      toggleTheme(target);
      return;
    }

    changeTheme(selectedTheme, target);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Toggle theme"
      onClick={(e) => toggleTheme(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme(e.currentTarget);
        }
      }}
      className="inline-flex bg-muted rounded-full p-1 border border-border cursor-pointer"
    >
      <button
        type="button"
        aria-label="Use light theme"
        onClick={(e) => {
          e.stopPropagation();
          handleThemeButtonClick('light', e.currentTarget);
        }}
        className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-accent text-black shadow-inner' : 'opacity-40 hover:opacity-100'}`}
      >
        <Sun size={14} />
      </button>
      <button
        type="button"
        aria-label="Use dark theme"
        onClick={(e) => {
          e.stopPropagation();
          handleThemeButtonClick('dark', e.currentTarget);
        }}
        className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-accent text-black shadow-inner' : 'opacity-40 hover:opacity-100'}`}
      >
        <Moon size={14} />
      </button>
    </div>
  );
}
