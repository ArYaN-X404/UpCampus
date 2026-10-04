'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_POSTS, MOCK_PROFILES, MOCK_STATUS_EVENTS } from './data/mockData';
import { Post, PostComment, PostStatus, Profile, StatusEvent, UserRole } from './types';
import { supabase, isSupabaseConfigured } from './supabase/client';

export interface UpCampusContextType {
  currentUser: Profile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  posts: Post[];
  statusEvents: Record<string, StatusEvent[]>;
  comments: Record<string, PostComment[]>;
  escalatedPost: Post | null;
  closeEscalationModal: () => void;
  vote: (postId: string, delta: 1 | -1) => void;
  upvotePost: (postId: string) => void;
  downvotePost: (postId: string) => void;
  moderatePost: (postId: string, action: 'approve' | 'reject' | 'request_edit', reason?: string) => void;
  updatePostStatus: (postId: string, newStatus: PostStatus, remark?: string, pinned?: boolean) => void;
  resolvePostWithAdminNote: (postId: string, note: string) => void;
  verifyPost: (postId: string, fixed: boolean, comment?: string) => void;
  addPost: (post: Omit<Post, 'id' | 'created_at' | 'agree_count' | 'disagree_count' | 'net_votes' | 'impact_score'>) => Post;
  deletePost: (postId: string) => void;
  addComment: (postId: string, text: string) => PostComment;
  deleteComment: (postId: string, commentId: string) => void;
  resetDemoData: () => void;
  searchSimilar: (query: string, locationId?: number) => Post[];
  login: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, name?: string, role?: 'student' | 'admin') => Promise<boolean>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const UpCampusContext = createContext<UpCampusContextType | undefined>(undefined);

const STORAGE_KEY_POSTS = 'upcampus_posts_v2';
const STORAGE_KEY_EVENTS = 'upcampus_events_v2';
const STORAGE_KEY_ROLE = 'upcampus_role_v2';
const STORAGE_KEY_ADMIN = 'upcampus_admin_v2';
const STORAGE_KEY_THEME = 'upcampus_theme_v2';
const STORAGE_KEY_COMMENTS = 'upcampus_comments_v2';
const STORAGE_KEY_USER = 'upcampus_user_v2';

const INITIAL_COMMENTS: Record<string, PostComment[]> = {
  '1': [
    {
      id: 'c-101',
      post_id: '1',
      author_id: 'student-1',
      author_name: 'Aarav Sharma',
      author_handle: 'aarav_cs25',
      text: 'Almost twisted my ankle here last night. Really dangerous near the library turn.',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      votes: 14,
    }
  ],
  '2': [
    {
      id: 'c-102',
      post_id: '2',
      author_id: 'student-2',
      author_name: 'Priya Patel',
      author_handle: 'priya_ee',
      text: 'Water is leaking into the lower electrical shaft. Urgent attention needed!',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      votes: 9,
    }
  ],
  '3': [
    {
      id: 'c-103',
      post_id: '3',
      author_id: 'student-1',
      author_name: 'Aarav Sharma',
      author_handle: 'aarav_cs25',
      text: 'Professor had to cancel the lecture projection yesterday because of this HDMI cable.',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      votes: 6,
    }
  ]
};

export function sanitizePost(raw: any): Post {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `post-${Date.now()}`,
      author_id: 'student-1',
      kind: 'grievance',
      title: 'Campus Issue',
      description: '',
      category: 'Broken',
      severity: 1,
      safety_risk: false,
      department: 'General Maintenance',
      photos: [],
      anonymous: false,
      status: 'approved',
      agree_count: 1,
      disagree_count: 0,
      created_at: new Date().toISOString(),
      impact_score: 1.0,
      location_name: 'Campus Grounds',
      author_name: 'Student Citizen',
      user_vote: null,
    };
  }

  const safeId = String(raw.id || `post-${Date.now()}`);
  const safeTitle = String(raw.title || 'Campus Issue');
  const safeKind = raw.kind === 'suggestion' ? 'suggestion' : 'grievance';
  const safeStatus = raw.status || 'approved';
  const safeCategory = String(raw.category || (safeKind === 'suggestion' ? 'Needs' : 'Broken'));
  const safeAgree = typeof raw.agree_count === 'number' && !isNaN(raw.agree_count) ? Math.max(0, raw.agree_count) : 1;
  const safeDisagree = typeof raw.disagree_count === 'number' && !isNaN(raw.disagree_count) ? Math.max(0, raw.disagree_count) : 0;
  const safePhotos = Array.isArray(raw.photos) ? raw.photos.filter((p: any) => typeof p === 'string' && p.trim()) : [];
  const safeLocation = String(raw.location_name || raw.location?.name || 'Campus Grounds');
  const safeAuthor = String(raw.author_name || (raw.anonymous ? 'Anonymous Student' : 'Student Citizen'));
  const parsedImpact = typeof raw.impact_score === 'number' 
    ? raw.impact_score 
    : parseFloat(String(raw.impact_score || '0'));
  const safeImpact = isNaN(parsedImpact) ? safeAgree * 1.5 : parsedImpact;

  return {
    ...raw,
    id: safeId,
    title: safeTitle,
    kind: safeKind,
    status: safeStatus,
    category: safeCategory,
    description: raw.description ? String(raw.description) : '',
    agree_count: safeAgree,
    disagree_count: safeDisagree,
    photos: safePhotos,
    location_name: safeLocation,
    author_name: safeAuthor,
    impact_score: safeImpact,
    severity: [1, 2, 3].includes(raw.severity) ? raw.severity : 1,
    safety_risk: Boolean(raw.safety_risk),
    department: String(raw.department || 'General Maintenance'),
    created_at: raw.created_at && !isNaN(new Date(raw.created_at).getTime()) ? raw.created_at : new Date().toISOString(),
    user_vote: raw.user_vote === 1 || raw.user_vote === -1 ? raw.user_vote : null,
  };
}

export function UpCampusProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<Profile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [posts, setPosts] = useState<Post[]>(() => INITIAL_POSTS.map(sanitizePost));
  const [statusEvents, setStatusEvents] = useState<Record<string, StatusEvent[]>>(MOCK_STATUS_EVENTS);
  const [comments, setComments] = useState<Record<string, PostComment[]>>(INITIAL_COMMENTS);
  const [escalatedPost, setEscalatedPost] = useState<Post | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem(STORAGE_KEY_POSTS);
      const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      const savedComments = localStorage.getItem(STORAGE_KEY_COMMENTS);
      const savedRole = localStorage.getItem(STORAGE_KEY_ROLE) as UserRole | null;
      const savedAdmin = localStorage.getItem(STORAGE_KEY_ADMIN);
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark' | null;
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);

      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setAuthenticatedUser(u);
          setCurrentRole(u.role);
          setIsAdmin(u.role === 'admin');
        } catch {}
      }

      if (savedPosts) {
        const parsed = JSON.parse(savedPosts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed.map(sanitizePost));
        } else {
          setPosts(INITIAL_POSTS.map(sanitizePost));
        }
      }
      if (savedEvents) setStatusEvents(JSON.parse(savedEvents));
      if (savedComments) {
        try {
          setComments(JSON.parse(savedComments));
        } catch {}
      }
      if (savedRole && ['student', 'supervisor', 'admin'].includes(savedRole)) {
        setCurrentRole(savedRole);
      }
      if (savedAdmin) setIsAdmin(savedAdmin === 'true');
      if (savedTheme) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } else {
        applyTheme('light');
      }
    } catch {
      setPosts(INITIAL_POSTS.map(sanitizePost));
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Universal Cross-Device Background Sync (Works across all devices on Vercel)
  useEffect(() => {
    let isMounted = true;

    const pullUniversal = async () => {
      try {
        const res = await fetch('/api/sync');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            if (Array.isArray(json.data.posts) && json.data.posts.length > 0) {
              setPosts(json.data.posts.map(sanitizePost));
            }
            if (json.data.comments) {
              setComments((prev) => ({ ...prev, ...json.data.comments }));
            }
          }
        }
      } catch {
        // Fallback silently
      }
    };

    pullUniversal();
    const interval = setInterval(pullUniversal, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const applyTheme = (t: 'light' | 'dark') => {
    const root = document.getElementById('theme-root') || document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
    } catch {}
  };

  const toggleAdmin = () => {
    const next = !isAdmin;
    setIsAdmin(next);
    if (next) {
      setCurrentRole('admin');
    } else {
      setCurrentRole('student');
    }
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN, String(next));
    } catch {}
  };

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(statusEvents));
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
      localStorage.setItem(STORAGE_KEY_ROLE, currentRole);
      localStorage.setItem(STORAGE_KEY_ADMIN, String(isAdmin));
      if (authenticatedUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authenticatedUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {}
  }, [posts, statusEvents, comments, currentRole, isAdmin, authenticatedUser, isLoaded]);

  const currentUser: Profile = authenticatedUser || (
    currentRole === 'admin' || isAdmin
      ? MOCK_PROFILES['admin-1']
      : currentRole === 'supervisor'
        ? MOCK_PROFILES['supervisor-1']
        : MOCK_PROFILES['student-1']
  );

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    setIsAdmin(role === 'admin');
  };

  const calculateImpact = (post: Post, net: number) => {
    const sevMultiplier = post.severity === 3 ? 2.5 : post.severity === 2 ? 1.5 : 1.0;
    const daysOpen = Math.min(14, Math.floor((Date.now() - new Date(post.created_at).getTime()) / 86400000));
    const safetyBump = post.safety_risk ? 15 : 0;
    return Number((net * sevMultiplier + daysOpen * 0.5 + safetyBump).toFixed(1));
  };

  // Voting with 100-vote escalation trigger
  const vote = (postId: string, delta: 1 | -1) => {
    setPosts((prev) => {
      let triggeredEscalation: Post | null = null;

      const next = prev.map((p) => {
        if (String(p.id) !== String(postId)) return p;
        if (p.status === 'resolved') return p; // Cannot vote on solved

        const oldAgree = p.agree_count;
        let newAgree = p.agree_count;
        let newDisagree = p.disagree_count;
        let newVote: 1 | -1 | null = null;

        if (delta === 1) {
          if (p.user_vote === 1) {
            // Toggle off
            newAgree = Math.max(0, newAgree - 1);
            newVote = null;
          } else if (p.user_vote === -1) {
            newDisagree = Math.max(0, newDisagree - 1);
            newAgree += 1;
            newVote = 1;
          } else {
            newAgree += 1;
            newVote = 1;
          }
        } else {
          if (p.user_vote === -1) {
            newDisagree = Math.max(0, newDisagree - 1);
            newVote = null;
          } else if (p.user_vote === 1) {
            newAgree = Math.max(0, newAgree - 1);
            newDisagree += 1;
            newVote = -1;
          } else {
            newDisagree += 1;
            newVote = -1;
          }
        }

        const net = newAgree - newDisagree;
        const updatedPost: Post = {
          ...p,
          agree_count: newAgree,
          disagree_count: newDisagree,
          net_votes: net,
          impact_score: calculateImpact(p, net),
          user_vote: newVote,
        };

        // 100-Vote Escalation Feature from up_campus_code.html
        if (oldAgree === 99 && newAgree === 100 && delta === 1) {
          triggeredEscalation = updatedPost;
        }

        return updatedPost;
      });

      if (triggeredEscalation) {
        setEscalatedPost(triggeredEscalation);
      }

      return next;
    });
  };

  const upvotePost = (postId: string) => vote(postId, 1);
  const downvotePost = (postId: string) => vote(postId, -1);

  const closeEscalationModal = () => setEscalatedPost(null);

  const moderatePost = (postId: string, action: 'approve' | 'reject' | 'request_edit', reason?: string) => {
    const targetStatus: PostStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'needs_edit';

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return { ...p, status: targetStatus };
      })
    );

    const event: StatusEvent = {
      id: Date.now(),
      post_id: postId,
      to_status: targetStatus,
      remark: reason || (action === 'approve' ? 'Approved by Supervisor for public campus ranking.' : 'Rejected during moderation.'),
      pinned: false,
      actor_id: currentUser.id,
      actor: currentUser,
      created_at: new Date().toISOString(),
    };

    setStatusEvents((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), event],
    }));
  };

  const updatePostStatus = (postId: string, newStatus: PostStatus, remark?: string, pinned = false) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : p.resolved_at,
          admin_note: remark || p.admin_note,
        };
      })
    );

    const event: StatusEvent = {
      id: Date.now(),
      post_id: postId,
      to_status: newStatus,
      remark: remark || `Status changed to ${newStatus.replace('_', ' ')}`,
      pinned,
      actor_id: currentUser.id,
      actor: currentUser,
      created_at: new Date().toISOString(),
    };

    setStatusEvents((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), event],
    }));
  };

  const resolvePostWithAdminNote = (postId: string, note: string) => {
    updatePostStatus(
      postId,
      'resolved',
      note || 'Issue addressed by campus administration.',
      true
    );
  };

  const verifyPost = (postId: string, fixed: boolean, comment?: string) => {
    if (fixed) {
      updatePostStatus(postId, 'resolved', comment || 'Verified by students on site. Moved to Solved Archive.', true);
    } else {
      updatePostStatus(postId, 'reopened', comment || 'Student verification failed: Issue persists on site.', true);
    }
  };

  const addPost = (newPostData: Omit<Post, 'id' | 'created_at' | 'agree_count' | 'disagree_count' | 'net_votes' | 'impact_score'>) => {
    const rawPost: Post = {
      ...newPostData,
      id: `post-${Date.now()}`,
      created_at: new Date().toISOString(),
      agree_count: 1,
      disagree_count: 0,
      net_votes: 1,
      impact_score: newPostData.severity === 3 ? 17.5 : newPostData.severity === 2 ? 1.5 : 1.0,
      user_vote: 1,
      status: 'approved', // Auto-approved for frictionless demo as in up_campus_code.html
    };

    const newPost = sanitizePost(rawPost);
    setPosts((prev) => [newPost, ...prev]);

    // Push mutation to universal sync API for cross-device propagation
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_post', post: newPost }),
    }).catch(() => {});

    // Universal Cloud Database Sync
    if (isSupabaseConfigured()) {
      supabase.from('posts').insert({
        id: newPost.id,
        author_id: newPost.author_id,
        kind: newPost.kind,
        title: newPost.title,
        description: newPost.description,
        category: newPost.category,
        severity: newPost.severity,
        safety_risk: newPost.safety_risk,
        department: newPost.department,
        location_name: newPost.location_name,
        photos: newPost.photos,
        anonymous: newPost.anonymous,
        status: newPost.status,
        agree_count: 1,
        disagree_count: 0,
        created_at: newPost.created_at,
      }).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] insert post warning:', error.message);
      });
    }

    return newPost;
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => String(p.id) !== String(postId)));
    setComments((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });

    // Push deletion to universal sync API for all devices
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_post', postId }),
    }).catch(() => {});

    if (isSupabaseConfigured()) {
      supabase.from('posts').delete().eq('id', postId).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] delete post warning:', error.message);
      });
    }
  };

  const addComment = (postId: string, text: string): PostComment => {
    const newComment: PostComment = {
      id: `c-${Date.now()}`,
      post_id: postId,
      author_id: currentUser.id,
      author_name: currentUser.display_name,
      author_handle: currentUser.display_name.toLowerCase().replace(/\s+/g, '_'),
      text: text.trim(),
      created_at: new Date().toISOString(),
      votes: 1,
    };

    setComments((prev) => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] || [])],
    }));

    // Universal sync API dispatch
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_comment', comment: newComment }),
    }).catch(() => {});

    if (isSupabaseConfigured()) {
      supabase.from('comments').insert(newComment).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] insert comment warning:', error.message);
      });
    }

    return newComment;
  };

  const deleteComment = (postId: string, commentId: string) => {
    setComments((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
    }));

    // Universal sync API dispatch
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_comment', postId, commentId }),
    }).catch(() => {});

    if (isSupabaseConfigured()) {
      supabase.from('comments').delete().eq('id', commentId).then(({ error }) => {
        if (error) console.warn('[Supabase Sync] delete comment warning:', error.message);
      });
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setAuthenticatedUser(data.user);
        setCurrentRole(data.user.role);
        setIsAdmin(data.user.role === 'admin');
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
          localStorage.setItem(STORAGE_KEY_ROLE, data.user.role);
          localStorage.setItem(STORAGE_KEY_ADMIN, String(data.user.role === 'admin'));
        } catch {}
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const signUp = async (email: string, pass: string, name?: string, role?: 'student' | 'admin'): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password: pass, name, role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setAuthenticatedUser(data.user);
        setCurrentRole(data.user.role);
        setIsAdmin(data.user.role === 'admin');
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
          localStorage.setItem(STORAGE_KEY_ROLE, data.user.role);
          localStorage.setItem(STORAGE_KEY_ADMIN, String(data.user.role === 'admin'));
        } catch {}
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setAuthenticatedUser(null);
    setCurrentRole('student');
    setIsAdmin(false);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.setItem(STORAGE_KEY_ROLE, 'student');
      localStorage.setItem(STORAGE_KEY_ADMIN, 'false');
    } catch {}
  };

  const searchSimilar = (query: string, locationId?: number) => {
    if (!query || query.trim().length < 3) return [];
    const normalized = query.toLowerCase();
    const words = normalized.split(/\s+/).filter((w) => w.length > 2);

    return posts.filter((p) => {
      if (['rejected'].includes(p.status)) return false;
      const text = `${p.title} ${p.description || ''} ${p.location_name || ''}`.toLowerCase();
      const hits = words.filter((w) => text.includes(w));
      const hasSimilarLocation = locationId && p.location_id === locationId;
      return hits.length >= 1 || hasSimilarLocation;
    }).slice(0, 3);
  };

  const resetDemoData = () => {
    setPosts(INITIAL_POSTS.map(sanitizePost));
    setStatusEvents(MOCK_STATUS_EVENTS);
    setComments(INITIAL_COMMENTS);
    setCurrentRole('student');
    setIsAdmin(false);
    setAuthenticatedUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_POSTS);
      localStorage.removeItem(STORAGE_KEY_EVENTS);
      localStorage.removeItem(STORAGE_KEY_COMMENTS);
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.removeItem(STORAGE_KEY_ADMIN);
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}
  };

  return (
    <UpCampusContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        isAdmin,
        toggleAdmin,
        theme,
        toggleTheme,
        posts,
        statusEvents,
        comments,
        escalatedPost,
        closeEscalationModal,
        vote,
        upvotePost,
        downvotePost,
        moderatePost,
        updatePostStatus,
        resolvePostWithAdminNote,
        verifyPost,
        addPost,
        deletePost,
        addComment,
        deleteComment,
        login,
        signUp,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        resetDemoData,
        searchSimilar,
      }}
    >
      {children}
    </UpCampusContext.Provider>
  );
}

export function useUpCampus() {
  const context = useContext(UpCampusContext);
  if (!context) {
    throw new Error('useUpCampus must be used within an UpCampusProvider');
  }
  return context;
}
