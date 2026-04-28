'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, ShieldQuestion, School, User, Mail, Phone, BookOpen, GraduationCap, Lock, ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/db/supabase';

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
  const [schoolSearch, setSchoolSearch] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [openPicker, setOpenPicker] = useState<'school' | 'faculty' | 'department' | null>(null);
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [pendingAlumniAdvance, setPendingAlumniAdvance] = useState<number | null>(null);
  const [touched, setTouched] = useState({
    phone: false,
    email: false,
    password: false,
    full_name: false,
    z_name: false,
    course_of_study: false,
    security_answer: false,
  });
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
    status: 'regular' as 'regular' | 'alumni',
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get?.('ref');
    if (ref) update({ referral_code: ref });
  }, [searchParams]);

  const update = (patch: Partial<typeof formData>) => setFormData((s) => ({ ...s, ...patch }));

  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schools').select('id, name, slug, is_active').eq('is_active', true).order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: faculties = [] } = useQuery({
    queryKey: ['faculties', formData.school_id],
    queryFn: async () => {
      if (!formData.school_id) return [];
      const { data, error } = await supabase.from('faculties').select('id, school_id, name, slug').eq('school_id', formData.school_id).order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!formData.school_id,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', formData.faculty_id],
    queryFn: async () => {
      if (!formData.faculty_id) return [];
      const { data, error } = await supabase.from('departments').select('id, faculty_id, school_id, name, slug').eq('faculty_id', formData.faculty_id).order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!formData.faculty_id,
  });

  const selectedSchool = useMemo(() => schools.find((school: any) => school.id === formData.school_id), [schools, formData.school_id]);
  const selectedFaculty = useMemo(() => faculties.find((faculty: any) => faculty.id === formData.faculty_id), [faculties, formData.faculty_id]);
  const selectedDepartment = useMemo(() => departments.find((department: any) => department.id === formData.department_id), [departments, formData.department_id]);

  useEffect(() => {
    setFacultySearch('');
    setDepartmentSearch('');
    update({ faculty_id: '', department_id: '' });
    setOpenPicker(null);
  }, [formData.school_id]);

  useEffect(() => {
    setDepartmentSearch('');
    update({ department_id: '' });
    setOpenPicker(null);
  }, [formData.faculty_id]);

  const graduationDatePassed = Boolean(formData.graduation_date && new Date(`${formData.graduation_date}T00:00:00`).getTime() <= new Date(new Date().setHours(0, 0, 0, 0)).getTime());
  const passwordStrength = getPasswordStrength(formData.password);

  const isPhoneValid = /^\+?[0-9 ()-]{7,}$/.test(formData.phone.trim());
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPasswordValid = formData.password.length >= 8;
  const isStep0Valid = isPhoneValid && isEmailValid && isPasswordValid && formData.full_name.trim() && formData.z_name.trim();
  const isStep1Valid = formData.school_id.trim() && formData.faculty_id.trim() && formData.department_id.trim() && formData.course_of_study.trim();
  const isStep2Valid = formData.security_question.trim() && formData.security_answer.trim();

  const getStep0Error = () => {
    if (!isPhoneValid) return 'Phone number is invalid.';
    if (!isEmailValid) return 'Email address is invalid.';
    if (!isPasswordValid) return 'Password must be at least 8 characters long.';
    if (!formData.full_name.trim()) return 'Full name is required.';
    if (!formData.z_name.trim()) return 'Z name is required.';
    return '';
  };

  const getStep1Error = () => {
    if (!formData.school_id.trim()) return 'Please select a school.';
    if (!formData.faculty_id.trim()) return 'Please select a faculty.';
    if (!formData.department_id.trim()) return 'Please select a department.';
    if (!formData.course_of_study.trim()) return 'Course of study is required.';
    if (!formData.graduation_date.trim()) return 'Graduation date is required.';
    return '';
  };

  const getStep2Error = () => {
    if (!formData.security_question.trim()) return 'Please select a recovery question.';
    if (!formData.security_answer.trim()) return 'Recovery answer is required.';
    return '';
  };

  const goNext = (target: number) => {
    if (step === 0 && !isStep0Valid) {
      setError(getStep0Error());
      return;
    }
    if (step === 1 && !isStep1Valid) {
      setError(getStep1Error());
      return;
    }
    if (step === 2 && !isStep2Valid) {
      setError(getStep2Error());
      return;
    }

    // Graduation date check only when continuing from step 1
    if (step === 1) {
      if (!formData.graduation_date.trim()) {
        setError('Graduation date is required.');
        return;
      }
      const selectedDate = new Date(`${formData.graduation_date}T00:00:00`);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const isPast = selectedDate.getTime() <= now.getTime();
      if (isPast && formData.status !== 'alumni') {
        setPendingAlumniAdvance(target);
        setShowAlumniModal(true);
        return;
      }
      if (!isPast && formData.status !== 'regular') {
        update({ status: 'regular' });
      }
    }

    setError('');
    setStep(target);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const finalStatus = graduationDatePassed && formData.status === 'alumni' ? 'alumni' : 'regular';
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: finalStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
      router.push('/in/login');
    } finally {
      setLoading(false);
    }
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
            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600">{error}</div>}
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                  <Field icon={Phone} label="Phone Number">
                    <input value={formData.phone} onChange={(e) => { update({ phone: e.target.value }); setError(''); }} onBlur={() => setTouched((s) => ({ ...s, phone: true }))} className="auth-input" placeholder="+1 (555) 000-0000" />
                  </Field>
                  {touched.phone && !isPhoneValid && <p className="text-[11px] text-red-500">Enter a valid phone number.</p>}

                  <Field icon={Mail} label="Email">
                    <input type="email" value={formData.email} onChange={(e) => { update({ email: e.target.value }); setError(''); }} onBlur={() => setTouched((s) => ({ ...s, email: true }))} className="auth-input" placeholder="you@school.edu" />
                  </Field>
                  {touched.email && !isEmailValid && <p className="text-[11px] text-red-500">Enter a valid email address.</p>}

                  <Field icon={Lock} label="Password">
                    <input type="password" value={formData.password} onChange={(e) => { update({ password: e.target.value }); setError(''); }} onBlur={() => setTouched((s) => ({ ...s, password: true }))} className="auth-input" placeholder="••••••••" />
                    <PasswordStrengthBar strength={passwordStrength} />
                  </Field>
                  {touched.password && !isPasswordValid && <p className="text-[11px] text-red-500">Password must be at least 8 characters long.</p>}

                  <Field icon={User} label="Full Name (only shown to you)">
                    <input value={formData.full_name} onChange={(e) => { update({ full_name: e.target.value }); setError(''); }} onBlur={() => setTouched((s) => ({ ...s, full_name: true }))} className="auth-input" placeholder="Your full name" />
                  </Field>
                  {touched.full_name && !formData.full_name.trim() && <p className="text-[11px] text-red-500">Full name is required.</p>}

                  <Field icon={User} label="Z Name">
                    <input value={formData.z_name} onChange={(e) => { update({ z_name: e.target.value }); setError(''); }} onBlur={() => setTouched((s) => ({ ...s, z_name: true }))} className="auth-input" placeholder="Your personal username" />
                  </Field>
                  {touched.z_name && !formData.z_name.trim() && <p className="text-[11px] text-red-500">Z name is required.</p>}

                  <div className="flex justify-end pt-2"><button type="button" onClick={() => goNext(1)} className="btn">Continue</button></div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                  <SearchSelect
                    icon={School}
                    label="School"
                    placeholder="Search and select school"
                    search={schoolSearch}
                    setSearch={setSchoolSearch}
                    open={openPicker === 'school'}
                    setOpen={(open) => setOpenPicker(open ? 'school' : null)}
                    items={schools}
                    value={selectedSchool?.name || ''}
                    onSelect={(item: any) => update({ school_id: item.id, faculty_id: '', department_id: '' })}
                  />
                  <SearchSelect
                    icon={BookOpen}
                    label="Faculty"
                    placeholder={formData.school_id ? 'Search and select faculty' : 'Select a school first'}
                    search={facultySearch}
                    setSearch={setFacultySearch}
                    open={openPicker === 'faculty'}
                    setOpen={(open) => setOpenPicker(open ? 'faculty' : null)}
                    items={faculties}
                    value={selectedFaculty?.name || ''}
                    disabled={!formData.school_id}
                    onSelect={(item: any) => update({ faculty_id: item.id, department_id: '' })}
                  />
                  <SearchSelect
                    icon={GraduationCap}
                    label="Department"
                    placeholder={formData.faculty_id ? 'Search and select department' : 'Select a faculty first'}
                    search={departmentSearch}
                    setSearch={setDepartmentSearch}
                    open={openPicker === 'department'}
                    setOpen={(open) => setOpenPicker(open ? 'department' : null)}
                    items={departments}
                    value={selectedDepartment?.name || ''}
                    disabled={!formData.faculty_id}
                    onSelect={(item: any) => update({ department_id: item.id })}
                  />
                  <Field icon={BookOpen} label="Course of Study">
                    <input value={formData.course_of_study} onChange={(e) => { update({ course_of_study: e.target.value }); setError(''); }} onBlur={() => setTouched((s) => ({ ...s, course_of_study: true }))} className="auth-input" placeholder="Computer Science" />
                  </Field>
                  {touched.course_of_study && !formData.course_of_study.trim() && <p className="text-[11px] text-red-500">Course of study is required.</p>}
                  <Field icon={ShieldQuestion} label="Graduation Date">
                    <input type="date" title="YYYY-MM-DD" value={formData.graduation_date} onChange={(e) => { update({ graduation_date: e.target.value }); setError(''); }} className="auth-input" required />
                  </Field>
                    {!formData.graduation_date.trim() && step === 1 && <p className="text-[11px] text-red-500">Graduation date is required.</p>}
                    <Field icon={User} label="Referral Code">
                      <input value={formData.referral_code} onChange={(e) => update({ referral_code: e.target.value })} className="auth-input" placeholder="Optional referral code" />
                    </Field>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(0)} className="btn-secondary">Back</button>
                    <button type="button" onClick={() => goNext(2)} className="btn">Continue</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                  <Field icon={ShieldQuestion} label="Recovery Question">
                    <select title="Recovery Question" value={formData.security_question} onChange={(e) => { update({ security_question: e.target.value }); setError(''); }} className="auth-input appearance-none">
                      <option value="" disabled>Select a question</option>
                      {QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </Field>
                  <Field icon={Lock} label="Secret Answer">
                    <input value={formData.security_answer} onChange={(e) => { update({ security_answer: e.target.value }); setError(''); }} onBlur={() => setTouched((s) => ({ ...s, security_answer: true }))} className="auth-input" placeholder="Keep it memorable" />
                  </Field>
                  {touched.security_answer && !formData.security_answer.trim() && <p className="text-[11px] text-red-500">Recovery answer is required.</p>}
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
                  <div><strong>School:</strong> {selectedSchool?.name || formData.school_id}</div>
                  <div><strong>Faculty:</strong> {selectedFaculty?.name || formData.faculty_id}</div>
                  <div><strong>Department:</strong> {selectedDepartment?.name || formData.department_id}</div>
                  <div><strong>Course:</strong> {formData.course_of_study}</div>
                  <div><strong>Graduation Date:</strong> {formData.graduation_date || 'Not set'}</div>
                  <div><strong>Recovery Question:</strong> {formData.security_question}</div>
                  <div><strong>Status:</strong> {formData.status}</div>
                </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(2)} className="btn-secondary">Back</button>
                    <button type="submit" disabled={loading || !isStep0Valid || !isStep1Valid || !isStep2Valid} className="btn flex-1">{loading ? <Loader2 className="animate-spin" /> : 'Sign up'}</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>

      {showAlumniModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl">
            <div className="space-y-3">
              <div className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                Alumni Confirmation
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Confirm your graduation</h2>
              <p className="text-sm text-foreground/60">
                Your graduation date has passed. If you&apos;ve completed school, confirm to continue as an alumni account.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => {
                  setShowAlumniModal(false);
                  setPendingAlumniAdvance(null);
                  update({ status: 'regular' });
                }}
              >
                Not yet
              </button>
              <button
                type="button"
                className="btn flex-1"
                onClick={() => {
                  update({ status: 'alumni' });
                  setShowAlumniModal(false);
                  if (pendingAlumniAdvance !== null) setStep(pendingAlumniAdvance);
                  setPendingAlumniAdvance(null);
                }}
              >
                Yes, I&apos;ve graduated
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2 max-w-sm mx-auto">
        <p className="text-center text-sm text-foreground/60">
          Already have an account?{' '}
          <Link href="/in/login" className="text-foreground font-medium hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-foreground/40">
          By continuing, you agree to Zyng&apos;s{' '}
          <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
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

function SearchSelect({
  icon: Icon,
  label,
  placeholder,
  search,
  setSearch,
  open,
  setOpen,
  items,
  value,
  onSelect,
  disabled = false,
}: {
  icon: any;
  label: string;
  placeholder: string;
  search: string;
  setSearch: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  items: Array<{ id: string; name: string }>;
  value: string;
  onSelect: (item: any) => void;
  disabled?: boolean;
}) {
  const filtered = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground/80">{label}</label>
      <div className="relative">
        <Icon size={16} className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${disabled ? 'text-foreground/10' : 'text-foreground/30'}`} />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className={`auth-input flex items-center justify-between text-left ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <span className={value ? 'text-foreground' : 'text-foreground/30'}>{value || placeholder}</span>
          <ChevronDown size={16} className="shrink-0 text-foreground/30" />
        </button>

        {open && !disabled && (
          <div className="absolute z-20 mt-2 w-full rounded-2xl border border-border bg-background shadow-2xl">
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}`}
                  className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto p-2">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-foreground/30">{item.id}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-sm text-foreground/40">No results found.</div>
              )}
            </div>
          </div>
        )}
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
