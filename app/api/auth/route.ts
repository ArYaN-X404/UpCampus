import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';

// Pre-defined campus directory accounts for authentication & verification
const STATIC_ACCOUNTS: Record<string, { pass: string; profile: Profile }> = {
  'admin@upcampus.edu': {
    pass: 'Admin@2026',
    profile: {
      id: 'admin-1',
      email: 'admin@upcampus.edu',
      display_name: 'Dr. S. Kapoor (Dean of Facilities)',
      role: 'admin',
      strikes: 0,
      is_demo: false,
      created_at: new Date('2024-01-01').toISOString(),
    }
  },
  'supervisor@upcampus.edu': {
    pass: 'Supervisor@2026',
    profile: {
      id: 'supervisor-1',
      email: 'supervisor@upcampus.edu',
      display_name: 'Ramesh Verma (Estate Supervisor)',
      role: 'supervisor',
      strikes: 0,
      is_demo: false,
      created_at: new Date('2024-01-01').toISOString(),
    }
  },
  'aarav@upcampus.edu': {
    pass: 'Student@2026',
    profile: {
      id: 'student-1',
      email: 'aarav@upcampus.edu',
      display_name: 'Aarav Sharma (CS-25)',
      role: 'student',
      strikes: 0,
      is_demo: false,
      created_at: new Date('2024-01-01').toISOString(),
    }
  },
  'priya@upcampus.edu': {
    pass: 'Student@2026',
    profile: {
      id: 'student-2',
      email: 'priya@upcampus.edu',
      display_name: 'Priya Patel (EE-26)',
      role: 'student',
      strikes: 0,
      is_demo: false,
      created_at: new Date('2024-01-01').toISOString(),
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. If Supabase Auth is configured, try Supabase native authentication
    if (isSupabaseConfigured()) {
      if (action === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              display_name: name || cleanEmail.split('@')[0],
              role: role || 'student',
            }
          }
        });

        if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        const profile: Profile = {
          id: data.user?.id || `user-${Date.now()}`,
          email: cleanEmail,
          display_name: name || cleanEmail.split('@')[0],
          role: (role === 'admin' ? 'admin' : 'student'),
          strikes: 0,
          is_demo: false,
          created_at: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, user: profile, session: data.session });
      }

      if (action === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data?.user) {
          const userMeta = data.user.user_metadata || {};
          const profile: Profile = {
            id: data.user.id,
            email: cleanEmail,
            display_name: userMeta.display_name || cleanEmail.split('@')[0],
            role: userMeta.role === 'admin' ? 'admin' : 'student',
            strikes: 0,
            is_demo: false,
            created_at: data.user.created_at || new Date().toISOString(),
          };
          return NextResponse.json({ success: true, user: profile, session: data.session });
        }
      }
    }

    // 2. Directory Authentication (Fallback for demo accounts and offline Vercel deployments)
    if (action === 'login') {
      const match = STATIC_ACCOUNTS[cleanEmail];
      if (match) {
        if (match.pass !== password) {
          return NextResponse.json(
            { success: false, error: 'Invalid password. Please check your credentials.' },
            { status: 401 }
          );
        }
        return NextResponse.json({
          success: true,
          user: match.profile,
          token: `token-${match.profile.id}-${Date.now()}`,
        });
      }

      // Check if it's an admin email domain or specific keyword
      const isAdminEmail = cleanEmail.includes('admin') || cleanEmail.includes('dean') || cleanEmail.includes('faculty');
      const dynamicProfile: Profile = {
        id: `user-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
        email: cleanEmail,
        display_name: cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        role: isAdminEmail ? 'admin' : 'student',
        strikes: 0,
        is_demo: false,
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        user: dynamicProfile,
        token: `token-${dynamicProfile.id}-${Date.now()}`,
      });
    }

    if (action === 'signup') {
      const isAdminEmail = cleanEmail.includes('admin') || role === 'admin';
      const newProfile: Profile = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        display_name: name || cleanEmail.split('@')[0],
        role: isAdminEmail ? 'admin' : 'student',
        strikes: 0,
        is_demo: false,
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        user: newProfile,
        token: `token-${newProfile.id}-${Date.now()}`,
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
