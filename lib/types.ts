export type UserRole = 'student' | 'supervisor' | 'admin';

export type PostKind = 'grievance' | 'suggestion';

export type PostStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'needs_edit'
  | 'under_review'
  | 'in_progress'
  | 'awaiting_verification'
  | 'resolved'
  | 'reopened';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  strikes: number;
  suspended_until?: string | null;
  is_demo: boolean;
  created_at: string;
}

export interface CampusLocation {
  id: number;
  name: string;
  zone: string;
  lat?: number | null;
  lng?: number | null;
}

export interface Post {
  id: string;
  author_id: string;
  kind: PostKind;
  title: string;
  description?: string | null;
  category: string;
  severity: 1 | 2 | 3;
  safety_risk: boolean;
  department: string;
  location_id?: number | null;
  photos: string[];
  anonymous: boolean;
  status: PostStatus;
  agree_count: number;
  disagree_count: number;
  ai_meta?: {
    confidence?: number;
    department_confidence?: number;
    detected_tags?: string[];
  } | null;
  created_at: string;
  resolved_at?: string | null;
  // Augmented client-side fields
  net_votes?: number;
  impact_score?: number;
  location?: CampusLocation | null;
  author_name?: string;
  user_vote?: 1 | -1 | null;
}

export interface Vote {
  post_id: string;
  user_id: string;
  value: 1 | -1;
  created_at: string;
}

export interface StatusEvent {
  id: number;
  post_id: string;
  from_status?: PostStatus | null;
  to_status: PostStatus;
  remark?: string | null;
  pinned: boolean;
  actor_id: string;
  created_at: string;
  actor?: Profile | null;
}

export interface Verification {
  post_id: string;
  user_id: string;
  fixed: boolean;
  comment?: string | null;
  created_at: string;
}

export interface ModerationAction {
  id: number;
  post_id: string;
  actor_id: string;
  action: 'approve' | 'reject' | 'request_edit';
  reason?: string | null;
  created_at: string;
}

export interface TriageResult {
  title: string;
  category: string;
  severity: 1 | 2 | 3;
  safety_risk: boolean;
  department: string;
  confidence?: number;
}
