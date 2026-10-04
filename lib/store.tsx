'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_POSTS, MOCK_PROFILES, MOCK_STATUS_EVENTS } from './data/mockData';
import { Post, PostStatus, Profile, StatusEvent, UserRole } from './types';

interface UpCampusContextType {
  currentUser: Profile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  posts: Post[];
  statusEvents: Record<string, StatusEvent[]>;
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
  resetDemoData: () => void;
  searchSimilar: (query: string, locationId?: number) => Post[];
}

const UpCampusContext = createContext<UpCampusContextType | undefined>(undefined);

const STORAGE_KEY_POSTS = 'upcampus_posts_v2';
const STORAGE_KEY_EVENTS = 'upcampus_events_v2';
const STORAGE_KEY_ROLE = 'upcampus_role_v2';
const STORAGE_KEY_ADMIN = 'upcampus_admin_v2';
const STORAGE_KEY_THEME = 'upcampus_theme_v2';

export function UpCampusProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [statusEvents, setStatusEvents] = useState<Record<string, StatusEvent[]>>(MOCK_STATUS_EVENTS);
  const [escalatedPost, setEscalatedPost] = useState<Post | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem(STORAGE_KEY_POSTS);
      const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      const savedRole = localStorage.getItem(STORAGE_KEY_ROLE) as UserRole | null;
      const savedAdmin = localStorage.getItem(STORAGE_KEY_ADMIN);
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark' | null;

      if (savedPosts) setPosts(JSON.parse(savedPosts));
      if (savedEvents) setStatusEvents(JSON.parse(savedEvents));
      if (savedRole && ['student', 'supervisor', 'admin'].includes(savedRole)) {
        setCurrentRole(savedRole);
      }
      if (savedAdmin) setIsAdmin(savedAdmin === 'true');
      if (savedTheme) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } else {
        // default to light theme to match up_campus_code.html
        applyTheme('light');
      }
    } catch {
      // fallback
    } finally {
      setIsLoaded(true);
    }
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
      localStorage.setItem(STORAGE_KEY_ROLE, currentRole);
      localStorage.setItem(STORAGE_KEY_ADMIN, String(isAdmin));
    } catch {}
  }, [posts, statusEvents, currentRole, isAdmin, isLoaded]);

  const currentUser = currentRole === 'admin' || isAdmin
    ? MOCK_PROFILES['admin-1']
    : currentRole === 'supervisor'
      ? MOCK_PROFILES['supervisor-1']
      : MOCK_PROFILES['student-1'];

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
        if (p.id !== postId) return p;
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
    const newPost: Post = {
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

    setPosts((prev) => [newPost, ...prev]);
    return newPost;
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
    setPosts(INITIAL_POSTS);
    setStatusEvents(MOCK_STATUS_EVENTS);
    setCurrentRole('student');
    setIsAdmin(false);
    try {
      localStorage.removeItem(STORAGE_KEY_POSTS);
      localStorage.removeItem(STORAGE_KEY_EVENTS);
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.removeItem(STORAGE_KEY_ADMIN);
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
