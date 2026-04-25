'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function RecoveryPage() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // In real app, we'd fetch the question for this phone number
  const mockQuestion = "What was the name of your first pet?";

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      // success
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full relative">
      <Link href="/in/login" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors w-fit">
        <ChevronLeft size={16} />
        Back to login
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto mt-12 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Restore Access</h1>
            <p className="text-sm text-foreground/60 mt-2">
              {step === 1 ? 'Enter your phone number to find your account.' : step === 2 ? 'Answer your security question.' : 'Create a new passcode.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                onSubmit={handlePhoneSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-black font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    Continue
                  </button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                onSubmit={handleAnswerSubmit}
                className="space-y-4"
              >
                <div className="p-4 bg-muted/50 rounded-lg border border-border mb-2">
                  <div className="text-xs font-medium text-foreground/60 mb-1">Security Question</div>
                  <div className="text-sm font-medium">{mockQuestion}</div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">Secret Answer</label>
                  <input
                    type="text"
                    required
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                    placeholder="Your answer"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-black font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    Verify Identity
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
                onSubmit={handleResetSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">New Passcode</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit" disabled={isLoading}
                    className="w-full bg-accent hover:bg-accent/90 text-black font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
                  >
                    {isLoading ? 'Resetting...' : 'Update Passcode'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-8 text-xs text-foreground/40 text-center max-w-sm mx-auto">
        If you've lost your phone number, please contact <br /> <Link href="/contact" className="underline hover:text-foreground">support</Link>.
      </div>
    </div>
  );
}
