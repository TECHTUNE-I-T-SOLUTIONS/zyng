'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const toggleTheme = (newTheme: 'light' | 'dark', e: React.MouseEvent) => {
    if (theme === newTheme) return;

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
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

  return (
    <div className="inline-flex bg-muted rounded-full p-1 border border-border">
      <button
        onClick={(e) => toggleTheme('light', e)}
        className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-accent text-black shadow-inner' : 'opacity-40 hover:opacity-100'}`}
      >
        <Sun size={14} />
      </button>
      <button
        onClick={(e) => toggleTheme('dark', e)}
        className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-accent text-black shadow-inner' : 'opacity-40 hover:opacity-100'}`}
      >
        <Moon size={14} />
      </button>
    </div>
  );
}

