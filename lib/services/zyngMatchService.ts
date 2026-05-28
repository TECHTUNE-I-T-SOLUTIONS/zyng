import { supabase } from '@/lib/db/supabase';

type PersonaRecord = {
  id: string;
  name: string;
  avatar_url?: string | null;
  is_active?: boolean | null;
};

type ZyngerRecord = {
  id: string;
  full_name?: string | null;
  z_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  status?: string | null;
  school_id?: string | null;
  faculty_id?: string | null;
  department_id?: string | null;
  skills?: unknown;
  hobbies?: unknown;
  personas?: PersonaRecord[];
};

export type ZyngerMatch = ZyngerRecord & {
  score: number;
  sharedSkills: string[];
  sharedHobbies: string[];
  reason: string;
  persona: PersonaRecord | null;
};

function toArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export function getPreferredPersona(personas?: PersonaRecord[] | null) {
  return personas?.find((persona) => persona.is_active) || null;
}

function scoreMatch(currentUser: ZyngerRecord, candidate: ZyngerRecord) {
  const currentSkills = toArray(currentUser.skills);
  const currentHobbies = toArray(currentUser.hobbies);
  const candidateSkills = toArray(candidate.skills);
  const candidateHobbies = toArray(candidate.hobbies);

  const sharedSkills = currentSkills.filter((skill) => candidateSkills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase()));
  const sharedHobbies = currentHobbies.filter((hobby) => candidateHobbies.some((candidateHobby) => candidateHobby.toLowerCase() === hobby.toLowerCase()));
  const pluralize = (label: string, count: number) => `${count} ${label}${count === 1 ? '' : 's'}`;

  let score = (sharedSkills.length * 4) + (sharedHobbies.length * 3);

  if (currentUser.school_id && candidate.school_id && currentUser.school_id === candidate.school_id) score += 3;
  if (currentUser.faculty_id && candidate.faculty_id && currentUser.faculty_id === candidate.faculty_id) score += 2;
  if (currentUser.department_id && candidate.department_id && currentUser.department_id === candidate.department_id) score += 2;
  if (candidate.bio) score += 1;
  if (getPreferredPersona(candidate.personas)) score += 1;

  const reasonParts = [];
  if (sharedSkills.length) reasonParts.push(`${pluralize('shared skill', sharedSkills.length)}`);
  if (sharedHobbies.length) reasonParts.push(`${pluralize('shared hobby', sharedHobbies.length)}`);
  if (currentUser.department_id && candidate.department_id && currentUser.department_id === candidate.department_id) reasonParts.push('same department');
  if (currentUser.faculty_id && candidate.faculty_id && currentUser.faculty_id === candidate.faculty_id) reasonParts.push('same faculty');

  return {
    score,
    sharedSkills,
    sharedHobbies,
    reason: reasonParts.length ? reasonParts.join(' • ') : 'Campus profile match',
  };
}

export const zyngMatchService = {
  async getSuggestedZyngers(currentUser: ZyngerRecord, options?: { onlyAlumni?: boolean; limit?: number }) {
    if (!currentUser?.id || !currentUser.school_id) return [];

    let query = supabase
      .from('users')
      .select('id, full_name, z_name, avatar_url, bio, status, school_id, faculty_id, department_id, skills, hobbies, personas(id, name, avatar_url, is_active)')
      .eq('school_id', currentUser.school_id)
      .neq('id', currentUser.id)
      .order('created_at', { ascending: false });

    if (options?.onlyAlumni) {
      query = query.eq('status', 'alumni');
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || [])
      .map((candidate: ZyngerRecord) => {
        const match = scoreMatch(currentUser, candidate);
        return {
          ...candidate,
          ...match,
          persona: getPreferredPersona(candidate.personas),
        } as ZyngerMatch;
      })
      .filter((candidate: ZyngerMatch) => candidate.score > 0)
      .sort((left: ZyngerMatch, right: ZyngerMatch) => right.score - left.score);
  },
};
