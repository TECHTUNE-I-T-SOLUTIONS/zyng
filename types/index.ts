export type UserStatus = 'regular' | 'alumni';

export interface School {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
  logo_url?: string;
  created_at?: string;
}

export interface Faculty {
  id: string;
  school_id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface Department {
  id: string;
  school_id: string;
  faculty_id?: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  full_name?: string;
  z_name?: string;
  status: UserStatus;
  graduation_date?: string;
  
  school_id?: string;
  faculty_id?: string;
  department_id?: string;
  course_of_study?: string;
  
  hobbies?: string[];
  skills?: string[];
  bio?: string;
  portfolio_data?: any;
  
  trust_score: number;
  referral_code?: string;
  referred_by?: string;
  school?: School;
  faculty?: Faculty;
  department?: Department;
  personas?: Persona[];
  created_at: string;
}

export interface Persona {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  reputation: number;
  is_active: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  persona_id: string;
  user_id?: string;
  type: 'regular' | 'confession' | 'poll' | 'hot_take' | 'missed_connection' | 'trend' | 'pulse';
  content: string;
  media_url?: string;
  school_id?: string;
  poll_options?: any;
  expires_at?: string;
  created_at: string;
  persona?: Persona;
  user?: User;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  post_id: string;
  persona_id: string;
  parent_reply_id?: string;
  content: string;
  created_at: string;
  persona?: Persona;
}

export interface ZingRoom {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  is_accepted: boolean;
  created_at: string;
}

export interface ZingMessage {
  id: string;
  room_id: string;
  sender_id?: string;
  persona_id?: string;
  content: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface Zync {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface ReportReview {
  id: string;
  report_id: string;
  reviewer_id: string;
  status: 'pending' | 'reviewed' | 'escalated' | 'resolved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id?: string;
  code: string;
  status: 'pending' | 'signed_up' | 'verified' | 'rewarded' | 'disabled';
  created_at: string;
  updated_at?: string;
}

export type AdminLevel = 'super' | 'admin' | 'sub' | 'moderator';

export interface Admin {
  id: string;
  user_id?: string;
  email: string;
  level: AdminLevel;
  is_active: boolean;
  created_at: string;
}
