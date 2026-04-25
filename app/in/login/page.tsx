'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Logic for loginWithPhone will go here
    setTimeout(() => {
      router.push('/z-feed');
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full relative">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors w-fit">
        <ChevronLeft size={16} />
        Back to home
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto mt-12 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-foreground/60 mt-2">
              Sign in to your Zyng account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/80">Phone Number</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground/80">Passcode</label>
                <Link href="/in/recover" className="text-xs text-foreground/60 hover:text-foreground transition-colors">
                  Forgot passcode?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-black font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Connecting...' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-foreground/60">
            Don't have an account? <Link href="/in/signup" className="text-foreground font-medium hover:underline underline-offset-4">Sign up</Link>
          </p>
        </motion.div>
      </div>

      <div className="mt-8 text-xs text-foreground/40 text-center max-w-sm mx-auto">
        By continuing, you agree to Zyng's <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
      </div>
    </div>
  );
}
