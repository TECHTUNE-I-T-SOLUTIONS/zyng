'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const QUESTIONS = [
  "What was your childhood nickname?",
  "In what city did your parents meet?",
  "What was the name of your first pet?",
  "What was the make of your first car?",
  "What was your high school mascot?",
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    question: '',
    answer: '',
    campus: 'unilorin',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Logic for registration
    setTimeout(() => {
      router.push('/in/login');
    }, 1500);
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
            <h1 className="text-2xl font-semibold tracking-tight">Join Zyng</h1>
            <p className="text-sm text-foreground/60 mt-2">
              Create an account to join your campus network
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Passcode</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full bg-accent hover:bg-accent/90 text-black font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Recovery Question</label>
                    <select
                      required
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none"
                    >
                      <option value="" disabled>Select a question</option>
                      {QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80">Secret Answer</label>
                    <input
                      type="text"
                      required
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                      placeholder="Your answer"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-2.5 rounded-md transition-colors text-sm border border-border"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] bg-accent hover:bg-accent/90 text-black font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isLoading ? 'Creating Account...' : 'Sign up'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="text-center text-sm text-foreground/60">
            Already have an account? <Link href="/in/login" className="text-foreground font-medium hover:underline underline-offset-4">Sign in</Link>
          </p>
        </motion.div>
      </div>

      <div className="mt-8 text-xs text-foreground/40 text-center max-w-sm mx-auto">
        By continuing, you agree to Zyng's <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
      </div>
    </div>
  );
}
