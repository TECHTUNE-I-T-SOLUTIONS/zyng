'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, ShieldQuestion, School, User, Mail, Phone, BookOpen, GraduationCap, Lock } from 'lucide-react';
import Link from 'next/link';

const QUESTIONS = [
  "What was your childhood nickname?",
  "In what city did your parents meet?",
  "What was the name of your first pet?",
  "What was the make of your first car?",
  "What was your high school mascot?",
];

const STEPS = ['Account', 'Campus', 'Recovery', 'Review'];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="flex flex-col h-full relative">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors w-fit">
        <ChevronLeft size={16} />
        Back to home
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto mt-12 lg:mt-0">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Join Zyng</h1>
            <p className="text-sm text-foreground/60 mt-2">Create your campus identity in four steps.</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {STEPS.map((label, index) => (
                <div key={label} className={`h-1 rounded-full ${index <= step ? 'bg-accent' : 'bg-border'}`} />
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <Field icon={Phone} label="Phone Number"><input required value={formData.phone} onChange={(e) => update({ phone: e.target.value })} className="input" placeholder="+1 (555) 000-0000" /></Field>
                  <Field icon={Mail} label="Email"><input type="email" required value={formData.email} onChange={(e) => update({ email: e.target.value })} className="input" placeholder="you@school.edu" /></Field>
                  <Field icon={Lock} label="Password"><input type="password" required value={formData.password} onChange={(e) => update({ password: e.target.value })} className="input" placeholder="••••••••" /></Field>
                  <Field icon={User} label="Full Name"><input required value={formData.full_name} onChange={(e) => update({ full_name: e.target.value })} className="input" placeholder="Your full name" /></Field>
                  <Field icon={User} label="Z Name"><input required value={formData.z_name} onChange={(e) => update({ z_name: e.target.value })} className="input" placeholder="Your personal username" /></Field>
                  <div className="flex justify-end pt-2"><button type="button" onClick={() => setStep(1)} className="btn">Continue</button></div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <Field icon={School} label="School ID"><input required value={formData.school_id} onChange={(e) => update({ school_id: e.target.value })} className="input" placeholder="school UUID or slug mapping" /></Field>
                  <Field icon={BookOpen} label="Faculty ID"><input value={formData.faculty_id} onChange={(e) => update({ faculty_id: e.target.value })} className="input" placeholder="faculty UUID" /></Field>
                  <Field icon={GraduationCap} label="Department ID"><input value={formData.department_id} onChange={(e) => update({ department_id: e.target.value })} className="input" placeholder="department UUID" /></Field>
                  <Field icon={BookOpen} label="Course of Study"><input required value={formData.course_of_study} onChange={(e) => update({ course_of_study: e.target.value })} className="input" placeholder="Computer Science" /></Field>
                  <Field icon={ShieldQuestion} label="Graduation Date"><input type="date" value={formData.graduation_date} onChange={(e) => update({ graduation_date: e.target.value })} className="input" /></Field>
                  <Field icon={User} label="Referral Code"><input value={formData.referral_code} onChange={(e) => update({ referral_code: e.target.value })} className="input" placeholder="Optional referral code" /></Field>
                  <div className="flex gap-3 pt-2"><button type="button" onClick={() => setStep(0)} className="btn-secondary">Back</button><button type="button" onClick={() => setStep(2)} className="btn">Continue</button></div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <Field icon={ShieldQuestion} label="Recovery Question">
                    <select required value={formData.security_question} onChange={(e) => update({ security_question: e.target.value })} className="input appearance-none">
                      <option value="" disabled>Select a question</option>
                      {QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </Field>
                  <Field icon={Lock} label="Secret Answer"><input required value={formData.security_answer} onChange={(e) => update({ security_answer: e.target.value })} className="input" placeholder="Keep it memorable" /></Field>
                  <Field icon={BookOpen} label="Hobbies"><input value={formData.hobbies} onChange={(e) => update({ hobbies: e.target.value })} className="input" placeholder="Comma-separated hobbies" /></Field>
                  <Field icon={BookOpen} label="Skills"><input value={formData.skills} onChange={(e) => update({ skills: e.target.value })} className="input" placeholder="Comma-separated skills" /></Field>
                  <Field icon={User} label="Bio"><textarea value={formData.bio} onChange={(e) => update({ bio: e.target.value })} className="input min-h-28" placeholder="Tell the campus who you are" /></Field>
                  <div className="flex gap-3 pt-2"><button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button><button type="button" onClick={() => setStep(3)} className="btn">Continue</button></div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="rounded-2xl border border-border p-4 space-y-2 text-sm bg-muted/20">
                    <div><strong>Name:</strong> {formData.full_name}</div>
                    <div><strong>Z Name:</strong> @{formData.z_name}</div>
                    <div><strong>School:</strong> {formData.school_id}</div>
                    <div><strong>Course:</strong> {formData.course_of_study}</div>
                    <div><strong>Recovery Question:</strong> {formData.security_question}</div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(2)} className="btn-secondary">Back</button>
                    <button type="submit" disabled={loading} className="btn flex-1">
                      {loading ? <Loader2 className="animate-spin" /> : 'Sign up'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
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
