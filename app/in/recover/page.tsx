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

  const loadQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
    setLoading(true);
    try {
      // In production, verify the answer hash server-side before allowing reset.
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Restore Access</h1>
            <p className="text-sm text-foreground/60 mt-2">
              {done ? 'Your password has been updated.' : step === 1 ? 'Enter your phone number to find your account.' : step === 2 ? 'Answer your security question.' : 'Create a new passcode.'}
            </p>
          </div>

          {done ? (
            <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 text-sm flex items-center gap-2">
              <CheckCircle2 className="text-green-500" size={18} />
              Recovery complete. You can sign in now.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={loadQuestion} className="space-y-4">
                  <Field icon={Phone} label="Phone Number">
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+1 (555) 000-0000" />
                  </Field>
                  <button type="submit" className="btn w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Continue'}</button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={verifyAnswer} className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border mb-2">
                    <div className="text-xs font-medium text-foreground/60 mb-1">Security Question</div>
                    <div className="text-sm font-medium flex items-center gap-2"><ShieldQuestion size={16} /> {question || 'Security question not found.'}</div>
                  </div>
                  <Field icon={Lock} label="Secret Answer">
                    <input type="text" required value={answer} onChange={(e) => setAnswer(e.target.value)} className="input" placeholder="Your answer" />
                  </Field>
                  <button type="submit" className="btn w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Verify Identity'}</button>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={submitReset} className="space-y-4">
                  <Field icon={Lock} label="New Passcode">
                    <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="••••••••" />
                  </Field>
                  <button type="submit" className="btn w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Update Passcode'}</button>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground/80">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
        {children}
      </div>
    </div>
  );
}
