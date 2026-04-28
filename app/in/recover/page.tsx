'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, ShieldQuestion, Lock, Phone, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RecoveryPage() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const isPhoneValid = /^\+?[0-9 ()-]{7,}$/.test(phone.trim());
  const isAnswerValid = answer.trim().length >= 2;
  const isPasswordValid = newPassword.length >= 8;

  const loadQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      setError('Enter a valid phone number before continuing.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'question', phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not fetch security question');
      setQuestion(data?.security_question || '');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const verifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnswerValid) {
      setError('Please enter the answer to your recovery question.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('New passcode must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'reset', phone, answer, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <Link href="/in/login" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors w-fit">
        <ChevronLeft size={16} />
        Back to login
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto mt-12 lg:mt-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
              Recovery Flow
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Restore Access</h1>
            <p className="text-sm text-foreground/60">
              {done ? 'Your password has been updated.' : step === 1 ? 'Enter your phone number to find your account.' : step === 2 ? 'Answer your security question.' : 'Create a new passcode.'}
            </p>
          </div>

          {done ? (
            <div className="flex items-center gap-2 rounded-xl bg-green-500/5 p-4 text-sm">
              <CheckCircle2 className="text-green-500" size={18} />
              Recovery complete. You can sign in now.
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} onSubmit={loadQuestion} className="space-y-4">
                    <Field icon={Phone} label="Phone Number">
                      <input  type="tel" required value={phone} onChange={(e) => { setPhone(e.target.value); setError(''); }} className="auth-input" placeholder="+1 (555) 000-0000" aria-invalid={!isPhoneValid && phone.length > 0} />
                    </Field>
                    <button type="submit" className="btn w-full" disabled={loading || !isPhoneValid}>{loading ? <Loader2 className="animate-spin" /> : 'Continue'}</button>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.form key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} onSubmit={verifyAnswer} className="space-y-4">
                    <div className="rounded-xl bg-muted/40 p-4 text-sm">
                      <div className="mb-1 text-xs font-medium text-foreground/60">Security Question</div>
                      <div className="flex items-center gap-2 text-sm font-medium"><ShieldQuestion size={16} /> {question || 'Security question not found.'}</div>
                    </div>
                    <Field icon={Lock} label="Secret Answer">
                      <input type="text" required value={answer} onChange={(e) => { setAnswer(e.target.value); setError(''); }} className="auth-input" placeholder="Your answer" aria-invalid={!isAnswerValid && answer.length > 0} />
                    </Field>
                    <button type="submit" className="btn w-full" disabled={loading || !isAnswerValid}>{loading ? <Loader2 className="animate-spin" /> : 'Verify Identity'}</button>
                  </motion.form>
                )}

                {step === 3 && (
                  <motion.form key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} onSubmit={submitReset} className="space-y-4">
                    <Field icon={Lock} label="New Passcode">
                      <input  type="password" required value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError(''); }} className="auth-input" placeholder="••••••••" aria-invalid={!isPasswordValid && newPassword.length > 0} />
                    </Field>
                    <button type="submit" className="btn w-full" disabled={loading || !isPasswordValid}>{loading ? <Loader2 className="animate-spin" /> : 'Update Passcode'}</button>
                  </motion.form>
                )}
              </AnimatePresence>
            </>
          )}

          <div className="space-y-3 pt-2">
            <p className="text-center text-sm text-foreground/60">
              Remembered your passcode?{' '}
              <Link href="/in/login" className="text-foreground font-medium hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      <div className="mt-8 text-xs text-foreground/40 text-center max-w-sm mx-auto">
        By continuing, you agree to Zyng's <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
      </div>

    </div>
  );
}

function Field({ icon: Icon, label, children }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground/80">{label}</label>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
        {children}
      </div>
    </div>
  );
}
