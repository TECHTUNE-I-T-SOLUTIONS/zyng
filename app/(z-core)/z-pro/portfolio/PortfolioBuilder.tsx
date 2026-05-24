'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { alumniService } from '@/lib/services/alumniService';
import { portfolioService } from '@/lib/services/portfolioService';
import { resumeService } from '@/lib/services/resumeService';
import { useToast } from '@/components/toast';
import {
  Award,
  BookOpen,
  Briefcase,
  Download,
  Eye,
  FileText,
  LayoutGrid,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  UserRound,
} from 'lucide-react';

type PortfolioEntry = {
  id: string;
  label: string;
  value: string;
};

type PortfolioAttachment = {
  url: string;
  filename?: string;
  mime?: string;
  size?: number;
};

type PortfolioState = {
  id: string | null;
  title: string;
  summary: string;
  skills: string[];
  entries: PortfolioEntry[];
  attachments: PortfolioAttachment[];
};

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeText = (value: unknown) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const prettifyKey = (value: string) => value
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/^./, (ch) => ch.toUpperCase());

const uniqueStrings = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const text = normalizeText(value);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(text);
  }
  return result;
};

const normalizeAttachments = (value: unknown): PortfolioAttachment[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') {
        return {
          url: item,
          filename: item.split('/').pop() || 'Attachment',
        };
      }

      const url = normalizeText((item as any)?.url);
      if (!url) return null;

      return {
        url,
        filename: normalizeText((item as any)?.filename) || url.split('/').pop() || 'Attachment',
        mime: normalizeText((item as any)?.mime) || undefined,
        size: typeof (item as any)?.size === 'number' ? (item as any).size : undefined,
      };
    })
    .filter(Boolean) as PortfolioAttachment[];
};

const normalizeEntry = (item: any, fallbackLabel: string, index: number): PortfolioEntry | null => {
  if (!item) return null;

  if (typeof item === 'string') {
    const value = normalizeText(item);
    return value ? { id: createId(`entry-${index}`), label: fallbackLabel, value } : null;
  }

  const label = normalizeText(item.label ?? item.key ?? item.name ?? item.title ?? fallbackLabel);
  const value = normalizeText(item.value ?? item.val ?? item.data ?? item.text ?? item.content ?? '');

  if (!label && !value) return null;

  return {
    id: normalizeText(item.id) || createId(`entry-${index}`),
    label: label || fallbackLabel,
    value,
  };
};

const entriesFromLegacyObject = (value: any): PortfolioEntry[] => {
  if (Array.isArray(value)) {
    return value.map((item, index) => normalizeEntry(item, `Detail ${index + 1}`, index)).filter(Boolean) as PortfolioEntry[];
  }

  if (!value || typeof value !== 'object') return [];

  const result: PortfolioEntry[] = [];

  if (Array.isArray(value.experience)) {
    value.experience.forEach((experienceItem: any, index: number) => {
      const label = normalizeText(experienceItem?.role)
        ? `${normalizeText(experienceItem?.role)}${normalizeText(experienceItem?.company) ? ` @ ${normalizeText(experienceItem?.company)}` : ''}`
        : `Experience ${index + 1}`;
      const valueText = uniqueStrings([
        experienceItem?.duration,
        experienceItem?.location,
        experienceItem?.summary,
      ]).join(' • ') || uniqueStrings([experienceItem?.role, experienceItem?.company]).join(' — ');
      if (label || valueText) {
        result.push({ id: createId(`entry-exp-${index}`), label: label || `Experience ${index + 1}`, value: valueText });
      }
    });
  }

  if (Array.isArray(value.education)) {
    value.education.forEach((educationItem: any, index: number) => {
      const label = normalizeText(educationItem?.degree)
        ? `${normalizeText(educationItem?.degree)}${normalizeText(educationItem?.school) ? ` @ ${normalizeText(educationItem?.school)}` : ''}`
        : `Education ${index + 1}`;
      const valueText = uniqueStrings([
        educationItem?.year,
        educationItem?.duration,
        educationItem?.description,
      ]).join(' • ') || uniqueStrings([educationItem?.school, educationItem?.degree]).join(' — ');
      if (label || valueText) {
        result.push({ id: createId(`entry-edu-${index}`), label: label || `Education ${index + 1}`, value: valueText });
      }
    });
  }

  Object.entries(value).forEach(([key, itemValue]) => {
    if (key === 'experience' || key === 'education') return;
    const label = prettifyKey(key);
    if (Array.isArray(itemValue)) {
      const text = itemValue.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(', ');
      if (text.trim()) result.push({ id: createId(`entry-${key}`), label, value: text });
      return;
    }

    if (itemValue && typeof itemValue === 'object') {
      const text = JSON.stringify(itemValue);
      if (text !== '{}') result.push({ id: createId(`entry-${key}`), label, value: text });
      return;
    }

    const text = normalizeText(itemValue);
    if (text) result.push({ id: createId(`entry-${key}`), label, value: text });
  });

  return result;
};

const buildProfileEntries = (user: any, resumeContent: any): PortfolioEntry[] => {
  const entries: PortfolioEntry[] = [];

  const append = (label: string, value: unknown) => {
    const text = normalizeText(value);
    if (!text) return;
    entries.push({ id: createId(label.toLowerCase().replace(/\s+/g, '-')), label, value: text });
  };

  append('Full Name', user?.full_name || user?.z_name || '');
  append('Zyng Name', user?.z_name || '');
  append('Email', user?.email || '');
  append('Phone', user?.phone || '');
  append('School', user?.school?.name || '');
  append('Faculty', user?.faculty?.name || '');
  append('Department', user?.department?.name || '');
  append('Course of Study', user?.course_of_study || '');
  append('Graduation Date', user?.graduation_date ? new Date(user.graduation_date).toLocaleDateString() : '');
  append('Status', user?.status || '');
  append('Trust Score', typeof user?.trust_score === 'number' ? String(user.trust_score) : '');
  append('Referral Code', user?.referral_code || '');
  append('Hobbies', Array.isArray(user?.hobbies) ? user.hobbies.join(', ') : '');
  append('Bio', user?.bio || '');
  append('Resume Summary', resumeContent?.summary || '');

  return entries;
};

const normalizePortfolioRecord = (record: any): PortfolioState => ({
  id: record?.id ?? null,
  title: normalizeText(record?.title),
  summary: normalizeText(record?.summary),
  skills: uniqueStrings(Array.isArray(record?.skills) ? record.skills : []),
  entries: entriesFromLegacyObject(record?.entries),
  attachments: normalizeAttachments(record?.attachments),
});

const mergeEntries = (preferred: PortfolioEntry[], supplemental: PortfolioEntry[]) => {
  const seen = new Set(preferred.map((entry) => entry.label.toLowerCase()));
  return [
    ...preferred,
    ...supplemental.filter((entry) => {
      const key = entry.label.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  ];
};

const buildInitialPortfolio = (profileData: any, existingPortfolio: any | null): PortfolioState => {
  const user = profileData?.user;
  const seedEntries = buildProfileEntries(user, profileData?.resume?.content);
  const seedSkills = uniqueStrings([
    ...(Array.isArray(user?.skills) ? user.skills : []),
    ...(Array.isArray(profileData?.resume?.content?.skills) ? profileData.resume.content.skills : []),
  ]);
  const seedSummary = normalizeText(profileData?.resume?.content?.summary || user?.bio);
  const seedTitle = normalizeText(user?.full_name || user?.z_name) || 'Portfolio';

  if (!existingPortfolio) {
    return {
      id: null,
      title: seedTitle,
      summary: seedSummary,
      skills: seedSkills,
      entries: seedEntries,
      attachments: [],
    };
  }

  const current = normalizePortfolioRecord(existingPortfolio);
  return {
    id: current.id,
    title: current.title || seedTitle,
    summary: current.summary || seedSummary,
    skills: uniqueStrings([...(current.skills || []), ...seedSkills]),
    entries: mergeEntries(current.entries, seedEntries),
    attachments: current.attachments,
  };
};

const buildResumeContent = (portfolio: PortfolioState, profileData: any) => ({
  generated_from: 'portfolio',
  generated_at: new Date().toISOString(),
  profile: {
    full_name: profileData?.user?.full_name || '',
    z_name: profileData?.user?.z_name || '',
    email: profileData?.user?.email || '',
    phone: profileData?.user?.phone || '',
    school: profileData?.user?.school?.name || '',
    faculty: profileData?.user?.faculty?.name || '',
    department: profileData?.user?.department?.name || '',
    course_of_study: profileData?.user?.course_of_study || '',
    trust_score: profileData?.user?.trust_score ?? 0,
  },
  portfolio: {
    title: portfolio.title,
    summary: portfolio.summary,
    skills: portfolio.skills,
    entries: portfolio.entries,
    attachments: portfolio.attachments,
  },
  sections: {
    summary: portfolio.summary || profileData?.user?.bio || '',
    skills: portfolio.skills,
    key_details: portfolio.entries,
    attachments: portfolio.attachments,
  },
});

const renderPrintableHtml = (kind: 'portfolio' | 'resume', portfolio: PortfolioState, profileData: any) => {
  const user = profileData?.user || {};
  const detailsRows = portfolio.entries
    .map((entry) => `<tr><td>${entry.label}</td><td>${entry.value}</td></tr>`)
    .join('');

  const skillBadges = portfolio.skills
    .map((skill) => `<span class="pill">${skill}</span>`)
    .join('');

  const attachmentsList = portfolio.attachments
    .map((attachment) => `<li>${attachment.filename || attachment.url}</li>`)
    .join('');

  const summaryText = portfolio.summary || user.bio || 'Professional portfolio generated from Zyng profile data.';
  const title = portfolio.title || `${user.full_name || user.z_name || 'Zyng User'} Portfolio`;
  const heading = kind === 'resume' ? 'Resume' : 'Portfolio';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${heading}</title>
        <style>
          @page { size: A4; margin: 14mm; }
          * { box-sizing: border-box; }
          body {
            font-family: Inter, Arial, sans-serif;
            margin: 0;
            color: #101828;
            background: #ffffff;
          }
          .sheet {
            padding: 8px;
          }
          .top {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            align-items: flex-start;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 18px;
            margin-bottom: 18px;
          }
          h1 {
            margin: 0;
            font-size: 32px;
            line-height: 1.05;
          }
          .subtitle {
            margin: 8px 0 0;
            font-size: 13px;
            color: #475467;
          }
          .meta {
            text-align: right;
            font-size: 12px;
            color: #475467;
            line-height: 1.6;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1.15fr;
            gap: 18px;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .section-title {
            margin: 0 0 10px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            color: #475467;
          }
          .summary {
            font-size: 14px;
            line-height: 1.7;
            color: #1d2939;
            white-space: pre-wrap;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            border-top: 1px solid #eaecf0;
            padding: 10px 8px;
            vertical-align: top;
            font-size: 13px;
            line-height: 1.5;
          }
          td:first-child {
            width: 34%;
            font-weight: 700;
            color: #344054;
          }
          .pill {
            display: inline-block;
            padding: 5px 10px;
            border: 1px solid #d0d5dd;
            border-radius: 999px;
            font-size: 11px;
            margin: 0 6px 8px 0;
            background: #f9fafb;
          }
          ul { margin: 0; padding-left: 18px; }
          li { margin-bottom: 6px; }
          .muted { color: #667085; }
          .stack { display: grid; gap: 14px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .sheet { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="top">
            <div>
              <h1>${user.full_name || user.z_name || 'Zyng Member'}</h1>
              <p class="subtitle">${title}</p>
            </div>
            <div class="meta">
              <div>${user.email || ''}</div>
              <div>${user.phone || ''}</div>
              <div>${user.school?.name || ''}</div>
              <div>${user.faculty?.name || ''}</div>
              <div>${user.department?.name || ''}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="card">
                <div class="section-title">Summary</div>
                <div class="summary">${summaryText}</div>
              </div>

              <div class="card">
                <div class="section-title">Skills</div>
                <div>${skillBadges || '<span class="muted">No skills added yet.</span>'}</div>
              </div>

              <div class="card">
                <div class="section-title">Attachments</div>
                ${attachmentsList ? `<ul>${attachmentsList}</ul>` : '<div class="muted">No attachments added yet.</div>'}
              </div>
            </div>

            <div>
              <div class="card">
                <div class="section-title">Key Details</div>
                ${detailsRows ? `<table>${detailsRows}</table>` : '<div class="muted">No custom details added yet.</div>'}
              </div>

              <div class="card">
                <div class="section-title">Profile Snapshot</div>
                <div class="stack">
                  <div><strong>Status:</strong> ${user.status || '—'}</div>
                  <div><strong>Trust Score:</strong> ${user.trust_score ?? 0}</div>
                  <div><strong>Course:</strong> ${user.course_of_study || '—'}</div>
                  <div><strong>Graduation:</strong> ${user.graduation_date ? new Date(user.graduation_date).toLocaleDateString() : '—'}</div>
                  <div><strong>Bio:</strong> ${user.bio || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

const normalizeEntriesForSave = (entries: PortfolioEntry[]) => entries
  .map((entry) => ({
    id: entry.id,
    label: normalizeText(entry.label),
    value: normalizeText(entry.value),
  }))
  .filter((entry) => entry.label || entry.value);

export default function PortfolioBuilder() {
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const initializedRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);
  const [entryDraft, setEntryDraft] = useState({ label: '', value: '' });
  const [skillDraft, setSkillDraft] = useState('');

  const profileQuery = useQuery({
    queryKey: ['z-pro-portfolio-profile'],
    queryFn: () => alumniService.getProfileData(),
  });

  const user = profileQuery.data?.user;

  const portfolioQuery = useQuery({
    queryKey: ['z-pro-portfolio-record', user?.id],
    queryFn: () => portfolioService.getByUser(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!profileQuery.data?.user) return;
    if (user?.id && !portfolioQuery.isFetched) return;
    if (initializedRef.current) return;

    const initial = buildInitialPortfolio(profileQuery.data, portfolioQuery.data || null);
    setPortfolio(initial);
    initializedRef.current = true;
  }, [profileQuery.data, portfolioQuery.data, portfolioQuery.isFetched, user?.id]);

  const profileEntries = useMemo(() => buildProfileEntries(user, profileQuery.data?.resume?.content), [profileQuery.data?.resume?.content, user]);

  const stats = useMemo(() => {
    return {
      skills: portfolio?.skills.length || 0,
      entries: portfolio?.entries.length || 0,
      attachments: portfolio?.attachments.length || 0,
      linkedFields: profileEntries.length,
    };
  }, [portfolio, profileEntries.length]);

  const updateEntry = (id: string, patch: Partial<PortfolioEntry>) => {
    setPortfolio((current) => {
      if (!current) return current;
      return {
        ...current,
        entries: current.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
      };
    });
  };

  const removeEntry = (id: string) => {
    setPortfolio((current) => {
      if (!current) return current;
      return {
        ...current,
        entries: current.entries.filter((entry) => entry.id !== id),
      };
    });
  };

  const addEntry = (label = '', value = '') => {
    setPortfolio((current) => {
      if (!current) return current;
      return {
        ...current,
        entries: [...current.entries, { id: createId('entry'), label, value }],
      };
    });
  };

  const syncProfileFields = () => {
    if (!profileQuery.data?.user) return;
    const seed = buildInitialPortfolio(profileQuery.data, portfolioQuery.data || null);
    setPortfolio((current) => {
      if (!current) return seed;
      return {
        ...current,
        title: current.title || seed.title,
        summary: current.summary || seed.summary,
        skills: uniqueStrings([...current.skills, ...seed.skills]),
        entries: mergeEntries(current.entries, seed.entries),
      };
    });
    show('Profile fields synced into your portfolio', 'success');
  };

  const addSkill = (value: string) => {
    const skill = normalizeText(value);
    if (!skill || !portfolio) return;
    setPortfolio({
      ...portfolio,
      skills: uniqueStrings([...portfolio.skills, skill]),
    });
    setSkillDraft('');
  };

  const removeSkill = (skill: string) => {
    if (!portfolio) return;
    setPortfolio({
      ...portfolio,
      skills: portfolio.skills.filter((item) => item.toLowerCase() !== skill.toLowerCase()),
    });
  };

  const handleAttachFile = async (file: File) => {
    if (!portfolio) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const response = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl, resourceType: 'raw' }),
        });
        const json = await response.json();
        if (response.ok && json.url) {
          setPortfolio((current) => {
            if (!current) return current;
            return {
              ...current,
              attachments: [
                ...current.attachments,
                { url: json.url, filename: file.name, mime: file.type, size: file.size },
              ],
            };
          });
          show('Attachment added to portfolio', 'success');
        } else {
          throw new Error(json?.error || 'Upload failed');
        }
      } catch (error) {
        console.error(error);
        show('Attachment upload failed', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const onFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void handleAttachFile(file);
    event.target.value = '';
  };

  const handleSavePortfolio = async () => {
    if (!user?.id || !portfolio) {
      show('Sign in to save your portfolio', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: portfolio.id,
        user_id: user.id,
        title: normalizeText(portfolio.title) || `${user.full_name || user.z_name || 'Portfolio'}`,
        summary: normalizeText(portfolio.summary),
        skills: uniqueStrings(portfolio.skills),
        entries: normalizeEntriesForSave(portfolio.entries),
        attachments: normalizeAttachments(portfolio.attachments),
      };

      const saved = portfolio.id
        ? await portfolioService.update(portfolio.id, payload)
        : await portfolioService.create(payload);

      const normalized = normalizePortfolioRecord(saved);
      setPortfolio({
        ...normalized,
        title: normalized.title || payload.title,
        summary: normalized.summary || payload.summary,
        skills: uniqueStrings([...(normalized.skills || []), ...payload.skills]),
        entries: mergeEntries(normalized.entries, profileEntries),
      });
      show('Portfolio saved', 'success');
      await portfolioQuery.refetch();
    } catch (error) {
      console.error(error);
      show('Failed to save portfolio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openPrintableView = (kind: 'portfolio' | 'resume') => {
    if (!portfolio) return;
    const html = renderPrintableHtml(kind, portfolio, profileQuery.data);
    const win = window.open('', '_blank');
    if (!win) {
      show('Popup blocked by the browser', 'error');
      return;
    }

    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  };

  const generateResume = async () => {
    if (!user?.id || !portfolio) {
      show('Sign in to generate a resume', 'error');
      return;
    }

    setGenerating(true);
    try {
      const content = buildResumeContent(portfolio, profileQuery.data);
      await resumeService.saveResume(user.id, content, profileQuery.data?.resume?.id);
      show('Resume generated and saved', 'success');
      openPrintableView('resume');
    } catch (error) {
      console.error(error);
      show('Failed to generate resume', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const isLoading = profileQuery.isLoading || !profileQuery.data || (user?.id && !portfolioQuery.isFetched);

  if (isLoading || !portfolio) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  const profileSnapshot = [
    ['Full name', user?.full_name || user?.z_name || 'Unknown'],
    ['Email', user?.email || 'Not set'],
    ['Phone', user?.phone || 'Not set'],
    ['School', user?.school?.name || 'Not set'],
    ['Faculty', user?.faculty?.name || 'Not set'],
    ['Department', user?.department?.name || 'Not set'],
    ['Course', user?.course_of_study || 'Not set'],
    ['Trust score', user?.trust_score ?? 0],
  ] as const;

  return (
    <div className="space-y-8 pb-20">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 rounded-[2rem] border border-border bg-gradient-to-br from-muted via-background to-muted/60 p-5 sm:p-6 lg:p-8"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              <Sparkles size={12} /> Portfolio Builder
            </div>
            <h1 className="text-3xl font-black tracking-tighter sm:text-4xl lg:text-5xl">
              Build your portfolio from your live Zyng profile.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-foreground/60 sm:text-base">
              The builder pulls in your profile, school, faculty, department, skills, and anything already saved on your account so you can finish the rest in a few steps.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={syncProfileFields}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-xs font-black uppercase tracking-widest transition-all hover:border-accent hover:text-accent"
            >
              <RefreshCw size={14} /> Sync profile
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-xs font-black uppercase tracking-widest transition-all hover:border-accent hover:text-accent"
            >
              <UploadCloud size={14} /> Attach file
            </button>
            <button
              type="button"
              onClick={handleSavePortfolio}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save portfolio
            </button>
            <button
              type="button"
              onClick={generateResume}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-xs font-black uppercase tracking-widest transition-all hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              Generate resume
            </button>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
          className="hidden"
          title="Upload attachment"
          aria-label="Upload attachment"
          onChange={onFilePicked}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Sparkles} label="Skills" value={stats.skills} />
          <StatCard icon={LayoutGrid} label="Details" value={stats.entries} />
          <StatCard icon={UploadCloud} label="Attachments" value={stats.attachments} />
          <StatCard icon={BookOpen} label="Profile fields" value={stats.linkedFields} />
        </div>
      </motion.header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-border bg-muted p-5 sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black uppercase tracking-[0.18em] text-foreground/80">Portfolio identity</h2>
                <p className="text-xs text-foreground/40">Name the portfolio and add the short summary recruiters will see first.</p>
              </div>
              <button
                type="button"
                onClick={syncProfileFields}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/60 transition-all hover:border-accent hover:text-accent"
              >
                <UserRound size={14} /> Use profile data
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <input
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-accent"
                placeholder="Portfolio title"
                value={portfolio.title}
                onChange={(e) => setPortfolio({ ...portfolio, title: e.target.value })}
              />
              <textarea
                className="min-h-[140px] w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none transition-all focus:border-accent"
                placeholder="Short summary of who you are and what you want to show"
                value={portfolio.summary}
                onChange={(e) => setPortfolio({ ...portfolio, summary: e.target.value })}
              />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[2rem] border border-border bg-muted p-5 sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black uppercase tracking-[0.18em] text-foreground/80">Skills</h2>
                <p className="text-xs text-foreground/40">Pulled from your profile and editable right here.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(skillDraft);
                    }
                  }}
                  placeholder="Add skill"
                  className="w-40 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-accent sm:w-52"
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillDraft)}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {portfolio.skills.length ? portfolio.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-sm font-bold text-accent transition-all hover:bg-accent/15"
                  title="Remove skill"
                >
                  {skill}
                  <Trash2 size={12} />
                </button>
              )) : (
                <p className="text-sm italic text-foreground/30">No skills yet. Start with the ones already on your profile.</p>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] border border-border bg-muted p-5 sm:p-6"
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-[0.18em] text-foreground/80">Key details</h2>
                <p className="text-xs text-foreground/40">This is the two-column table you can keep adding to as your portfolio grows.</p>
              </div>
              <button
                type="button"
                onClick={() => addEntry('Address', '')}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/60 transition-all hover:border-accent hover:text-accent"
              >
                <Plus size={14} /> Add row
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {['Address', 'Location', 'Website', 'LinkedIn', 'GitHub', 'Portfolio Link'].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => addEntry(label, '')}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-foreground/55 transition-all hover:border-accent hover:text-accent"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {portfolio.entries.length ? portfolio.entries.map((entry) => (
                <div key={entry.id} className="grid grid-cols-1 gap-3 rounded-[1.4rem] border border-border bg-background p-4 md:grid-cols-[1fr_1.45fr_auto]">
                  <input
                    value={entry.label}
                    onChange={(e) => updateEntry(entry.id, { label: e.target.value })}
                    placeholder="Entry"
                    className="rounded-xl border border-border bg-muted px-3 py-2 text-sm font-semibold outline-none transition-all focus:border-accent"
                  />
                  <input
                    value={entry.value}
                    onChange={(e) => updateEntry(entry.id, { value: e.target.value })}
                    placeholder="Value"
                    className="rounded-xl border border-border bg-muted px-3 py-2 text-sm outline-none transition-all focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-muted px-3 py-2 text-foreground/60 transition-all hover:border-red-400 hover:text-red-500"
                    aria-label={`Remove ${entry.label || 'detail'}`}
                    title={`Remove ${entry.label || 'detail'}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )) : (
                <div className="rounded-[1.5rem] border border-dashed border-border bg-background/40 p-8 text-center text-sm text-foreground/40">
                  Add custom rows like Address, Website, LinkedIn, GitHub, awards, or any other detail you want to show.
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-[2rem] border border-border bg-muted p-5 sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black uppercase tracking-[0.18em] text-foreground/80">Attachments</h2>
                <p className="text-xs text-foreground/40">Upload certificates, portfolios, or supporting documents.</p>
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-background px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/60 transition-all hover:border-accent hover:text-accent"
              >
                <UploadCloud size={14} /> Upload
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
              className="hidden"
              title="Upload attachment"
              aria-label="Upload attachment"
              onChange={onFilePicked}
            />

            <div className="space-y-3">
              {portfolio.attachments.length ? portfolio.attachments.map((attachment) => (
                <div key={attachment.url} className="flex flex-col gap-3 rounded-[1.2rem] border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{attachment.filename || attachment.url}</div>
                    <div className="truncate text-xs text-foreground/40">{attachment.mime || attachment.url}</div>
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-xs font-black uppercase tracking-widest transition-all hover:border-accent hover:text-accent"
                  >
                    Open <ArrowIcon />
                  </a>
                </div>
              )) : (
                <div className="rounded-[1.5rem] border border-dashed border-border bg-background/40 p-8 text-center text-sm text-foreground/40">
                  Add supporting files to enrich your portfolio.
                </div>
              )}
            </div>
          </motion.section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-border bg-gradient-to-br from-muted to-background p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-black">
                <UserRound size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-[0.18em] text-foreground/80">Profile snapshot</h2>
                <p className="text-xs text-foreground/40">Everything that is already linked to your account.</p>
              </div>
            </div>

            <div className="space-y-3">
              {profileSnapshot.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{label}</div>
                  <div className="max-w-[55%] text-right text-sm font-semibold text-foreground/80">{String(value)}</div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[2rem] border border-border bg-muted p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black uppercase tracking-[0.18em] text-foreground/80">Live preview</h2>
                <p className="text-xs text-foreground/40">A clean export of your portfolio data.</p>
              </div>
              <button
                type="button"
                onClick={() => openPrintableView('portfolio')}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/60 transition-all hover:border-accent hover:text-accent"
              >
                <Eye size={14} /> Preview
              </button>
            </div>

            <div className="space-y-4 rounded-[1.5rem] border border-border bg-background p-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Title</div>
                <div className="mt-1 text-base font-black">{portfolio.title || 'Portfolio'}</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Summary</div>
                <div className="mt-1 text-sm leading-6 text-foreground/70">{portfolio.summary || 'Add a short summary to tell recruiters who you are.'}</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Skills</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {portfolio.skills.length ? portfolio.skills.slice(0, 8).map((skill) => (
                    <span key={skill} className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-bold text-accent">
                      {skill}
                    </span>
                  )) : <span className="text-sm text-foreground/40">No skills added yet.</span>}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Custom rows</div>
                <div className="mt-2 rounded-2xl border border-border overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {portfolio.entries.slice(0, 5).map((entry) => (
                        <tr key={entry.id} className="border-b border-border last:border-b-0">
                          <td className="w-1/3 bg-muted px-3 py-2 font-bold text-foreground/60">{entry.label || 'Entry'}</td>
                          <td className="px-3 py-2 text-foreground/80">{entry.value || 'Value'}</td>
                        </tr>
                      ))}
                      {!portfolio.entries.length && (
                        <tr>
                          <td className="px-3 py-4 text-center text-xs text-foreground/40" colSpan={2}>Add rows to build the exported two-column table.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] border border-border bg-gradient-to-br from-accent/15 to-background p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-black">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-[0.18em] text-foreground/80">Resume generator</h2>
                <p className="text-xs text-foreground/40">Turn your portfolio into a professional résumé and save it.</p>
              </div>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-border bg-background p-4">
              <div className="text-sm leading-6 text-foreground/70">
                Click generate to save a résumé record in the database, then print the professional layout as a PDF from the browser.
              </div>
              <button
                type="button"
                onClick={generateResume}
                disabled={generating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-xs font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Generate resume PDF
              </button>
              <button
                type="button"
                onClick={() => openPrintableView('resume')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-4 py-3 text-xs font-black uppercase tracking-widest transition-all hover:border-accent hover:text-accent"
              >
                <Eye size={14} /> Preview resume
              </button>
            </div>
          </motion.section>
        </aside>
      </div>
    </div>
  );
}

function ArrowIcon() {
  return <span aria-hidden="true">→</span>;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-foreground/40">{label}</div>
          <div className="mt-1 text-2xl font-black">{value}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
