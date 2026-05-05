'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/db/supabase';


// Normalize phone number for consistent DB lookup
function normalizePhone(phone: string) {
  // Remove spaces, dashes, parentheses
  let normalized = phone.replace(/[\s()-]/g, '');
  // Ensure it starts with +
  if (!normalized.startsWith('+')) {
    // Optionally, add your country code here if you want to enforce it
    normalized = '+234' + normalized; // Uncomment for Nigeria default
  }
  return normalized;
}


export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ phone: false, password: false });
  const router = useRouter();

  const isPhoneValid = /^\+?[0-9 ()-]{7,}$/.test(phoneNumber.trim());
  const isPasswordValid = password.length >= 8;
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ phone: true, password: true });

    if (!isPhoneValid) {
      setError('Enter a valid phone number.');
      return;
    }
    if (!isPasswordValid) {
      setError('Passcode must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {

      const normalizedPhone = normalizePhone(phoneNumber);
      const { data: userRecord, error: lookupError } = await supabase
        .from('users')
        .select('email, status')
        .eq('phone', normalizedPhone)
        .single();

      if (lookupError) throw lookupError;
      if (!userRecord?.email) throw new Error('No account email found for that phone number.');

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password,
      });
      if (authError) throw authError;

      // Mint server cookie for routes that rely on sb-access-token
      try {
        const uid = authData?.user?.id;
        if (uid) {
          await fetch('/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid }),
          });
        }
      } catch (err) {
        console.warn('failed to mint server auth cookie', err);
      }

      router.push(userRecord.status === 'alumni' ? '/z-alumni/dashboard' : '/z-feed');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
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
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/80">Phone Number</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => { setPhoneNumber(e.target.value); setError(''); }}
                onBlur={() => setTouched((s) => ({ ...s, phone: true }))}
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="+1 (555) 000-0000"
              />
              {touched.phone && !isPhoneValid && <p className="text-[11px] text-red-500">Enter a valid phone number.</p>}
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
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onBlur={() => setTouched((s) => ({ ...s, password: true }))}
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="••••••••"
              />
              <PasswordStrengthBar strength={passwordStrength} />
              {touched.password && !isPasswordValid && <p className="text-[11px] text-red-500">Passcode must be at least 8 characters long.</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !isPhoneValid || !isPasswordValid}
                className="w-full bg-accent hover:bg-accent/90 text-black font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Sign in'}
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

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function PasswordStrengthBar({ strength }: { strength: number }) {
  const label = strength <= 1 ? 'Weak' : strength <= 3 ? 'Fair' : 'Strong';
  const color = strength <= 1 ? 'bg-red-500' : strength <= 3 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, strength * 20)}%` }} />
      </div>
      <div className="text-[11px] text-foreground/40">{label} password</div>
    </div>
  );
}
