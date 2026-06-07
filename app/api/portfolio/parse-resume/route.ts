import { createRequire } from 'node:module';
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const require = createRequire(import.meta.url);

const SECTION_ALIASES: Record<string, string[]> = {
  summary: ['summary', 'professional summary', 'profile', 'objective', 'career objective', 'about'],
  experience: ['experience', 'work experience', 'employment history', 'professional experience', 'work history'],
  education: ['education', 'academic background', 'qualifications'],
  skills: ['skills', 'technical skills', 'core skills', 'competencies', 'tools', 'technologies'],
  projects: ['projects', 'selected projects', 'portfolio', 'personal projects'],
  certifications: ['certifications', 'certificates', 'licenses', 'awards', 'achievements'],
};

type ResumeEntry = {
  id: string;
  label: string;
  value: string;
};

type ParsedResumePayload = {
  text: string;
  parsed: {
    name: string;
    email: string;
    phone: string;
    summary: string;
    skills: string[];
    sections: Array<{
      title: string;
      entries: ResumeEntry[];
      groups?: Array<{
        id: string;
        title: string;
        fields: ResumeEntry[];
      }>;
    }>;
    keyDetails: ResumeEntry[];
  };
};

type AiExperience = {
  role?: string;
  company?: string;
  dates?: string;
  location?: string;
  details?: string[];
};

const GEMINI_MODEL_FALLBACKS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-pro',
];

const normalizeText = (value: unknown) => String(value || '')
  .replace(/\r/g, '\n')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const dataUrlToBuffer = (dataUrl: string) => {
  const [, payload] = dataUrl.split(',');
  if (!payload) throw new Error('Invalid file payload');
  return Buffer.from(payload, 'base64');
};

const inferMime = (filename = '', mime = '') => {
  const lower = filename.toLowerCase();
  if (mime) return mime;
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (lower.endsWith('.doc')) return 'application/msword';
  return 'application/octet-stream';
};

const cleanResumeLine = (line: string) => line
  .replace(/^[\s\u2022*+-]+/, '')
  .replace(/\s+/g, ' ')
  .trim();

const isNoiseLine = (line: string) => {
  const normalized = cleanResumeLine(line).toLowerCase();
  return !normalized
    || /^--?\s*\d+\s+of\s+\d+\s*--?$/.test(normalized)
    || /^page\s+\d+(\s+of\s+\d+)?$/.test(normalized)
    || normalized === 'resume'
    || normalized === 'curriculum vitae'
    || normalized === 'cv';
};

const sectionKeyForLine = (line: string) => {
  const normalized = line.toLowerCase().replace(/[:\-\u2013\u2014]/g, '').trim();
  return Object.entries(SECTION_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] || null;
};

const compactLines = (lines: string[]) => lines.map(cleanResumeLine).filter((line) => !isNoiseLine(line));

const splitSections = (text: string) => {
  const sections: Record<string, string[]> = {};
  let current = 'summary';

  for (const rawLine of text.split('\n')) {
    const line = cleanResumeLine(rawLine);
    if (isNoiseLine(line)) continue;
    const section = sectionKeyForLine(line);
    if (section) {
      current = section;
      sections[current] ||= [];
      continue;
    }
    sections[current] ||= [];
    sections[current].push(line);
  }

  return sections;
};

const unique = (items: string[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = item.trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const extractEmail = (text: string) => text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
const extractPhone = (text: string) => text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() || '';

const parseSkills = (sections: Record<string, string[]>, text: string) => {
  const skillText = (sections.skills || []).join(', ');
  const candidates = skillText
    .split(/[,\u2022|;]/)
    .map((item) => item.replace(/^[-*]\s*/, '').trim())
    .filter((item) => item.length >= 2 && item.length <= 40);

  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'SQL', 'PostgreSQL',
    'Supabase', 'Firebase', 'UI/UX', 'Figma', 'Tailwind CSS', 'HTML', 'CSS', 'Git',
    'Project Management', 'Communication', 'Leadership', 'Data Analysis', 'Machine Learning',
  ];

  const found = commonSkills.filter((skill) => new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text));
  return unique([...candidates, ...found]).slice(0, 24);
};

const simpleLinesToEntries = (title: string, lines: string[]) => compactLines(lines)
  .map((line, index) => {
    const [labelPart, ...valueParts] = line.split(/\s+[|\u2013\u2014]\s+/);
    const hasClearSeparator = valueParts.length > 0 && labelPart.length <= 80;
    return {
      id: `${title.toLowerCase()}-${index}`,
      label: hasClearSeparator ? labelPart.trim() : `${title} ${index + 1}`,
      value: hasClearSeparator ? valueParts.join(' | ').trim() : line,
    };
  })
  .filter((entry) => entry.value);

const looksLikeDatedHeading = (line: string) => /\b(19|20)\d{2}\b/.test(line)
  || /\b(present|current|intern|engineer|developer|designer|manager|lead|founder|co-founder|cto|ceo)\b/i.test(line);

const looksLikeBullet = (line: string) => {
  const words = line.split(/\s+/).length;
  return words > 7 || /^(built|designed|developed|implemented|integrated|led|managed|created|engineered|architected|improved|launched|supported|delivered)\b/i.test(line);
};

const headingLabel = (line: string, fallback: string) => {
  const firstPart = line.split(/\s+[|\u2013\u2014]\s+/)[0]?.trim();
  if (firstPart && firstPart.length <= 80) return firstPart;
  return fallback;
};

const groupedLinesToEntries = (title: string, lines: string[]) => {
  const entries: ResumeEntry[] = [];
  let active: { label: string; parts: string[] } | null = null;

  const flush = () => {
    if (!active) return;
    const value = unique(active.parts).join(' ');
    if (value) {
      entries.push({
        id: `${title.toLowerCase()}-${entries.length}`,
        label: active.label,
        value,
      });
    }
    active = null;
  };

  compactLines(lines).forEach((line) => {
    const isHeading = !looksLikeBullet(line) && looksLikeDatedHeading(line);

    if (isHeading) {
      flush();
      active = { label: headingLabel(line, `${title} ${entries.length + 1}`), parts: [line] };
      return;
    }

    if (!active) {
      active = {
        label: looksLikeBullet(line) ? `${title} ${entries.length + 1}` : headingLabel(line, `${title} ${entries.length + 1}`),
        parts: [line],
      };
      return;
    }

    active.parts.push(line);
  });

  flush();
  return entries;
};

const linesToEntries = (title: string, lines: string[]) => {
  if (['Experience', 'Projects'].includes(title)) {
    return groupedLinesToEntries(title, lines);
  }

  return simpleLinesToEntries(title, lines);
};

const keyDetailsFromSections = (sections: Record<string, string[]>) => {
  const education = compactLines(sections.education || []);
  const latestEducation = education.find((line) => /\b(degree|b\.?sc|bachelor|master|diploma|university|college|school)\b/i.test(line));
  return [
    latestEducation ? ['Education', latestEducation] : null,
  ].filter(Boolean) as [string, string][];
};

const topSummaryLines = (sections: Record<string, string[]>) => compactLines(sections.summary || [])
  .filter((line) => !extractEmail(line) && !extractPhone(line) && !sectionKeyForLine(line))
  .slice(0, 4);

const linesToSummary = (sections: Record<string, string[]>) => topSummaryLines(sections).join(' ').slice(0, 700);

const firstUsefulLines = (text: string) => text
  .split('\n')
  .map(cleanResumeLine)
  .filter((line) => !isNoiseLine(line))
  .slice(0, 12);

const detectName = (lines: string[]) => lines.find((line) => (
  !line.includes('@')
  && !extractPhone(line)
  && !/\b(19|20)\d{2}\b/.test(line)
  && !sectionKeyForLine(line)
  && line.length <= 70
  && line.split(/\s+/).length <= 5
)) || '';

const extractJsonObject = (text: string) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('AI parser returned no JSON object');
  return JSON.parse(candidate.slice(start, end + 1));
};

const entry = (id: string, label: unknown, value: unknown): ResumeEntry | null => {
  const cleanLabel = normalizeText(String(label || ''));
  const cleanValue = normalizeText(String(value || ''));
  if (!cleanLabel || !cleanValue) return null;
  return { id, label: cleanLabel, value: cleanValue };
};

const formatExperienceValue = (experience: AiExperience) => unique([
  experience.company ? `Company: ${experience.company}` : '',
  experience.dates ? `Dates: ${experience.dates}` : '',
  experience.location ? `Location: ${experience.location}` : '',
  Array.isArray(experience.details) && experience.details.length ? `Details: ${experience.details.join(' ')}` : '',
]).join(' | ');

const normalizeAiPayload = (raw: any, cleanText: string): ParsedResumePayload => {
  const fallbackSections = splitSections(cleanText);
  const firstLines = firstUsefulLines(cleanText);
  const experiences = Array.isArray(raw?.experience) ? raw.experience : [];
  const education = Array.isArray(raw?.education) ? raw.education : [];
  const projects = Array.isArray(raw?.projects) ? raw.projects : [];
  const certifications = Array.isArray(raw?.certifications) ? raw.certifications : [];
  const referees = Array.isArray(raw?.referees) ? raw.referees : [];
  const otherSections = Array.isArray(raw?.otherSections) ? raw.otherSections : [];

  const experienceEntries = experiences
    .map((experience: AiExperience, index: number) => entry(
      `experience-${index}`,
      experience.role || `Experience ${index + 1}`,
      formatExperienceValue(experience),
    ))
    .filter(Boolean) as ResumeEntry[];
  const experienceGroups = experiences
    .map((experience: AiExperience, index: number) => {
      const fields = [
        entry(`experience-${index}-role`, 'Title', experience.role),
        entry(`experience-${index}-company`, 'Name', experience.company),
        entry(`experience-${index}-dates`, 'Date', experience.dates),
        entry(`experience-${index}-location`, 'Location', experience.location),
        entry(`experience-${index}-activities`, 'Activities / Details', Array.isArray(experience.details) ? experience.details.join('\n') : ''),
      ].filter(Boolean) as ResumeEntry[];

      return {
        id: `experience-group-${index}`,
        title: normalizeText(experience.role) || `Experience ${index + 1}`,
        fields,
      };
    })
    .filter((group: { fields: ResumeEntry[] }) => group.fields.length);

  const educationEntries = education
    .map((item: any, index: number) => entry(
      `education-${index}`,
      item.degree || item.certificate || item.school || `Education ${index + 1}`,
      unique([
        item.school ? `School: ${item.school}` : '',
        item.year || item.dates ? `Date: ${item.year || item.dates}` : '',
        item.details ? `Details: ${Array.isArray(item.details) ? item.details.join(' ') : item.details}` : '',
      ]).join(' | '),
    ))
    .filter(Boolean) as ResumeEntry[];
  const educationGroups = education
    .map((item: any, index: number) => {
      const fields = [
        entry(`education-${index}-degree`, 'Title', item.degree || item.certificate),
        entry(`education-${index}-school`, 'Name', item.school),
        entry(`education-${index}-date`, 'Date', item.year || item.dates),
        entry(`education-${index}-details`, 'Details', Array.isArray(item.details) ? item.details.join('\n') : item.details),
      ].filter(Boolean) as ResumeEntry[];

      return {
        id: `education-group-${index}`,
        title: normalizeText(item.degree || item.certificate || item.school) || `Education ${index + 1}`,
        fields,
      };
    })
    .filter((group: { fields: ResumeEntry[] }) => group.fields.length);

  const projectEntries = projects
    .map((item: any, index: number) => entry(
      `project-${index}`,
      item.name || item.title || `Project ${index + 1}`,
      unique([
        item.role ? `Role: ${item.role}` : '',
        item.dates ? `Dates: ${item.dates}` : '',
        item.description ? `Details: ${Array.isArray(item.description) ? item.description.join(' ') : item.description}` : '',
        Array.isArray(item.technologies) && item.technologies.length ? `Technologies: ${item.technologies.join(', ')}` : '',
      ]).join(' | '),
    ))
    .filter(Boolean) as ResumeEntry[];
  const projectGroups = projects
    .map((item: any, index: number) => {
      const fields = [
        entry(`project-${index}-name`, 'Title', item.name || item.title),
        entry(`project-${index}-role`, 'Role', item.role),
        entry(`project-${index}-dates`, 'Date', item.dates),
        entry(`project-${index}-details`, 'Activities / Details', Array.isArray(item.description) ? item.description.join('\n') : item.description),
        entry(`project-${index}-tech`, 'Technologies', Array.isArray(item.technologies) ? item.technologies.join(', ') : ''),
      ].filter(Boolean) as ResumeEntry[];

      return {
        id: `project-group-${index}`,
        title: normalizeText(item.name || item.title) || `Project ${index + 1}`,
        fields,
      };
    })
    .filter((group: { fields: ResumeEntry[] }) => group.fields.length);

  const certificationEntries = certifications
    .map((item: any, index: number) => entry(
      `certification-${index}`,
      item.name || item.title || `Certification ${index + 1}`,
      unique([
        item.issuer ? `Issuer: ${item.issuer}` : '',
        item.year || item.date ? `Date: ${item.year || item.date}` : '',
      ]).join(' | ') || item.name || item.title,
    ))
    .filter(Boolean) as ResumeEntry[];
  const refereeGroups = referees
    .map((item: any, index: number) => {
      const fields = [
        entry(`referee-${index}-name`, 'Name', item.name),
        entry(`referee-${index}-role`, 'Role', item.role),
        entry(`referee-${index}-org`, 'Organization', item.organization),
        entry(`referee-${index}-contact`, 'Contact', item.contact),
      ].filter(Boolean) as ResumeEntry[];

      return {
        id: `referee-group-${index}`,
        title: normalizeText(item.name) || `Referee ${index + 1}`,
        fields,
      };
    })
    .filter((group: { fields: ResumeEntry[] }) => group.fields.length);

  const dynamicSections = otherSections
    .map((section: any, sectionIndex: number) => ({
      title: normalizeText(section.title) || `Additional Section ${sectionIndex + 1}`,
      entries: [],
      groups: (Array.isArray(section.items) ? section.items : []).map((item: any, itemIndex: number) => ({
        id: `other-${sectionIndex}-group-${itemIndex}`,
        title: normalizeText(item.title) || `Item ${itemIndex + 1}`,
        fields: (Array.isArray(item.fields) ? item.fields : [])
          .map((field: any, fieldIndex: number) => entry(
            `other-${sectionIndex}-${itemIndex}-field-${fieldIndex}`,
            field.label,
            field.value,
          ))
          .filter(Boolean) as ResumeEntry[],
      })).filter((group: { title: string; fields: ResumeEntry[] }) => group.title || group.fields.length),
    }))
    .filter((section: { title: string; groups: any[] }) => section.groups.length);

  const name = normalizeText(raw?.name) || detectName(firstLines);
  const email = normalizeText(raw?.email) || extractEmail(cleanText);
  const phone = normalizeText(raw?.phone) || extractPhone(cleanText);
  const skills = unique(Array.isArray(raw?.skills) ? raw.skills.map((skill: unknown) => String(skill)) : parseSkills(fallbackSections, cleanText));
  const summary = normalizeText(raw?.summary) || linesToSummary(fallbackSections);

  return {
    text: cleanText,
    parsed: {
      name,
      email,
      phone,
      summary,
      skills,
      sections: [
        { title: 'Experience', entries: experienceGroups.length ? [] : experienceEntries, groups: experienceGroups },
        { title: 'Education', entries: educationGroups.length ? [] : educationEntries, groups: educationGroups },
        { title: 'Projects', entries: projectGroups.length ? [] : projectEntries, groups: projectGroups },
        { title: 'Certifications & Awards', entries: certificationEntries.length ? certificationEntries : linesToEntries('Certifications', fallbackSections.certifications || []) },
        { title: 'Referees', entries: [], groups: refereeGroups },
        ...dynamicSections,
      ].filter((section) => section.entries.length || section.groups?.length),
      keyDetails: [
        ['Resume Name', name],
        ['Email', email],
        ['Phone', phone],
        ...keyDetailsFromSections(fallbackSections),
      ].filter(([, value]) => value).map(([label, value], index) => ({ id: `resume-detail-${index}`, label, value })),
    },
  };
};

const parseResumeTextWithAi = async (cleanText: string) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are Zyng AI, a resume parser for a portfolio builder.
Extract structured resume data from the text below and return only valid JSON.

Rules:
- Do not invent facts.
- Detect multiple experiences separately.
- For every experience, split the role/title, company/business name, date range, optional location, and bullet details.
- If a line says "Co-Founder & CTO | Whispr | 2025 - Present", return role "Co-Founder & CTO", company "Whispr", dates "2025 - Present".
- Do not return labels like "Experience 1" when a real role exists.
- Keep details concise but complete.

JSON shape:
{
  "name": "",
  "email": "",
  "phone": "",
  "summary": "",
  "skills": [],
  "experience": [
    { "role": "", "company": "", "dates": "", "location": "", "details": [] }
  ],
  "education": [
    { "degree": "", "school": "", "year": "", "details": "" }
  ],
  "projects": [
    { "name": "", "role": "", "dates": "", "description": [], "technologies": [] }
  ],
  "certifications": [
    { "name": "", "issuer": "", "year": "" }
  ],
  "referees": [
    { "name": "", "role": "", "organization": "", "contact": "" }
  ],
  "otherSections": [
    { "title": "", "items": [{ "title": "", "fields": [{ "label": "", "value": "" }] }] }
  ]
}

Resume text:
${cleanText.slice(0, 22000)}
`;

  for (const model of GEMINI_MODEL_FALLBACKS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });
      const json = extractJsonObject(response.text || '');
      return normalizeAiPayload(json, cleanText);
    } catch (error) {
      console.warn(`Gemini resume parse failed with ${model}`, error);
    }
  }

  return null;
};

const extractPdfText = async (buffer: Buffer) => {
  const { PDFParse } = require('pdf-parse') as typeof import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text || '';
  } finally {
    await parser.destroy();
  }
};

const parseResumeText = async (text: string) => {
  const cleanText = normalizeText(text);
  const aiParsed = await parseResumeTextWithAi(cleanText);
  if (aiParsed) return aiParsed;

  const sections = splitSections(cleanText);
  const firstLines = firstUsefulLines(cleanText);
  const summary = linesToSummary(sections);
  const skills = parseSkills(sections, cleanText);
  const name = detectName(firstLines);

  return {
    text: cleanText,
    parsed: {
      name,
      email: extractEmail(cleanText),
      phone: extractPhone(cleanText),
      summary,
      skills,
      sections: [
        { title: 'Experience', entries: linesToEntries('Experience', sections.experience || []) },
        { title: 'Education', entries: linesToEntries('Education', sections.education || []) },
        { title: 'Projects', entries: linesToEntries('Projects', sections.projects || []) },
        { title: 'Certifications & Awards', entries: linesToEntries('Certifications', sections.certifications || []) },
      ].filter((section) => section.entries.length),
      keyDetails: [
        ['Resume Name', name],
        ['Email', extractEmail(cleanText)],
        ['Phone', extractPhone(cleanText)],
        ...keyDetailsFromSections(sections),
      ].filter(([, value]) => value).map(([label, value], index) => ({ id: `resume-detail-${index}`, label, value })),
    },
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filename = String(body.filename || '');
    const mime = inferMime(filename, String(body.mime || ''));
    const buffer = dataUrlToBuffer(String(body.dataUrl || ''));
    let text = '';

    if (mime === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
      text = await extractPdfText(buffer);
    } else if (mime.includes('wordprocessingml') || filename.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
    } else if (filename.toLowerCase().endsWith('.doc') || mime === 'application/msword') {
      return NextResponse.json({ error: 'Legacy .doc files are not supported yet. Please upload a PDF or DOCX resume.' }, { status: 415 });
    } else {
      return NextResponse.json({ error: 'Unsupported resume file type. Please upload PDF or DOCX.' }, { status: 415 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'No readable text was found in this file.' }, { status: 422 });
    }

    return NextResponse.json(await parseResumeText(text));
  } catch (error) {
    console.error('resume parse failed', error);
    return NextResponse.json({ error: 'Failed to parse resume file.' }, { status: 500 });
  }
}
