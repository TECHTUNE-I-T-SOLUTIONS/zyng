'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, ShieldQuestion, School, User, Mail, Phone, BookOpen, GraduationCap, Lock } from 'lucide-react';
import Link from 'next/link';

const QUESTIONS = [
  'What was your childhood nickname?',
  'In what city did your parents meet?',
  'What was the name of your first pet?',
  'What was the make of your first car?',
  'What was your high school mascot?',
];

const STEPS = ['Account', 'Campus', 'Recovery', 'Review'];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    full_name: '',
    email: '',
    z_name: '',
    school_id: '',
    faculty_id: '',
    department_id: '',
    course_of_study: '',
    hobbies: '',
    skills: '',
    bio: '',
    graduation_date: '',
    referral_code: '',
    security_question: '',
    security_answer: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
      router.push('/in/login');
    } finally {
      setLoading(false);
    }
  };

  const update = (patch: Partial<typeof formData>) => setFormData((s) => ({ ...s, ...patch }));

  const isPhoneValid = /^\+?[0-9 ()-]{7,}$/.test(formData.phone.trim());
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPasswordValid = formData.password.length >= 8;
  const isStep0Valid = Boolean(
    isPhoneValid &&
    isEmailValid &&
    isPasswordValid &&
    formData.full_name.trim() &&
    formData.z_name.trim()
  );

  const isStep1Valid = Boolean(
    formData.school_id.trim() &&
    formData.course_of_study.trim()
  );

  const isStep2Valid = Boolean(
    formData.security_question.trim() &&
    formData.security_answer.trim()
  );

  const goNext = (target: number) => {
    if (step === 0 && !isStep0Valid) {
      setError('Please complete phone, email, password, full name, and Z name before continuing.');
      return;
    }
    if (step === 1 && !isStep1Valid) {
      setError('Please select a school and enter your course of study before continuing.');
      return;
    }
    if (step === 2 && !isStep2Valid) {
      setError('Please choose a recovery question and provide an answer before continuing.');
      return;
    }
    setError('');
    setStep(target);
  };

  return (
    <div className="flex flex-col h-full relative">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors w-fit">
        <ChevronLeft size={16} />
        Back to home
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto mt-12 lg:mt-0">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
              Step {step + 1} of 4
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Join Zyng</h1>
            <p className="text-sm text-foreground/60">Create your Zyng identity in four steps.</p>
            <div className="grid grid-cols-4 gap-2">
              {STEPS.map((label, index) => (
                <div key={label} className="space-y-2">
                  <div className={`h-1.5 rounded-full ${index <= step ? 'bg-accent' : 'bg-border'}`} />
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${index <= step ? 'text-foreground' : 'text-foreground/30'} hidden sm:block`}>{label}</div>
                </div>
              ))}
            </div>
          </div>

            <form onSubmit={submit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                    <Field icon={Phone} label="Phone Number">
                      <input required value={formData.phone} onChange={(e) => update({ phone: e.target.value })} className="auth-input" placeholder="+1 (555) 000-0000" aria-invalid={!isPhoneValid && formData.phone.length > 0} />
                    </Field>
                    <Field icon={Mail} label="Email">
                      <input type="email" required value={formData.email} onChange={(e) => update({ email: e.target.value })} className="auth-input" placeholder="you@school.edu" aria-invalid={!isEmailValid && formData.email.length > 0} />
                    </Field>
                    <Field icon={Lock} label="Password">
                      <input type="password" required value={formData.password} onChange={(e) => update({ password: e.target.value })} className="auth-input" placeholder="••••••••" aria-invalid={!isPasswordValid && formData.password.length > 0} />
                    </Field>
                    <Field icon={User} label="Full Name (only shown to you)"><input required value={formData.full_name} onChange={(e) => update({ full_name: e.target.value })} className="auth-input" placeholder="Your full name" /></Field>
                    <Field icon={User} label="Z Name"><input required value={formData.z_name} onChange={(e) => update({ z_name: e.target.value })} className="auth-input" placeholder="Your personal username" /></Field>
                    <div className="flex justify-end pt-2"><button type="button" onClick={() => goNext(1)} className="btn">Continue</button></div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                    <Field icon={School} label="School ID"><input required value={formData.school_id} onChange={(e) => update({ school_id: e.target.value })} className="auth-input" placeholder="school UUID or slug mapping" aria-invalid={!formData.school_id.trim() && step === 1} /></Field>
                    <Field icon={BookOpen} label="Faculty ID"><input value={formData.faculty_id} onChange={(e) => update({ faculty_id: e.target.value })} className="auth-input" placeholder="faculty UUID" /></Field>
                    <Field icon={GraduationCap} label="Department ID"><input value={formData.department_id} onChange={(e) => update({ department_id: e.target.value })} className="auth-input" placeholder="department UUID" /></Field>
                    <Field icon={BookOpen} label="Course of Study"><input required value={formData.course_of_study} onChange={(e) => update({ course_of_study: e.target.value })} className="auth-input" placeholder="Computer Science" aria-invalid={!formData.course_of_study.trim() && step === 1} /></Field>
                    <Field icon={ShieldQuestion} label="Graduation Date"><input type="date" title="YYYY-MM-DD" value={formData.graduation_date} onChange={(e) => update({ graduation_date: e.target.value })} className="auth-input" /></Field>
                    <Field icon={User} label="Referral Code"><input value={formData.referral_code} onChange={(e) => update({ referral_code: e.target.value })} className="auth-input" placeholder="Optional referral code" /></Field>
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setStep(0)} className="btn-secondary">Back</button><button type="button" onClick={() => goNext(2)} className="btn">Continue</button></div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                    <Field icon={ShieldQuestion} label="Recovery Question">
                      <select title="Recovery Question" required value={formData.security_question} onChange={(e) => update({ security_question: e.target.value })} className="auth-input appearance-none">
                        <option value="" disabled>Select a question</option>
                        {QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </Field>
                    <Field icon={Lock} label="Secret Answer"><input required value={formData.security_answer} onChange={(e) => update({ security_answer: e.target.value })} className="auth-input" placeholder="Keep it memorable" aria-invalid={!formData.security_answer.trim() && step === 2} /></Field>
                    <Field icon={BookOpen} label="Hobbies"><input value={formData.hobbies} onChange={(e) => update({ hobbies: e.target.value })} className="auth-input" placeholder="Comma-separated hobbies" /></Field>
                    <Field icon={BookOpen} label="Skills"><input value={formData.skills} onChange={(e) => update({ skills: e.target.value })} className="auth-input" placeholder="Comma-separated skills" /></Field>
                    <Field icon={User} label="Bio"><textarea value={formData.bio} onChange={(e) => update({ bio: e.target.value })} className="auth-input min-h-28" placeholder="Tell the campus who you are" /></Field>
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button><button type="button" onClick={() => goNext(3)} className="btn">Continue</button></div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {formData.full_name}</div>
                      <div><strong>Z Name:</strong> @{formData.z_name}</div>
                      <div><strong>School:</strong> {formData.school_id}</div>
                      <div><strong>Course:</strong> {formData.course_of_study}</div>
                      <div><strong>Recovery Question:</strong> {formData.security_question}</div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setStep(2)} className="btn-secondary">Back</button>
                      <button type="submit" disabled={loading || !isStep0Valid || !isStep1Valid || !isStep2Valid} className="btn flex-1">{loading ? <Loader2 className="animate-spin" /> : 'Sign up'}</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="space-y-3 pt-2">
              <p className="text-center text-sm text-foreground/60">
                Already have an account?{' '}
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
