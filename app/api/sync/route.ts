import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_POSTS, MOCK_STATUS_EVENTS } from '@/lib/data/mockData';
import { Post, PostComment, StatusEvent } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

// In-memory universal fallback cache for cross-device synchronization on Vercel serverless instances
declare global {
  // eslint-disable-next-line no-var
  var __universalPosts: Post[] | undefined;
  // eslint-disable-next-line no-var
  var __universalComments: Record<string, PostComment[]> | undefined;
  // eslint-disable-next-line no-var
  var __universalEvents: Record<string, StatusEvent[]> | undefined;
}

if (!global.__universalPosts) {
  global.__universalPosts = [...INITIAL_POSTS];
}

if (!global.__universalComments) {
  global.__universalComments = {
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
    ]
  };
}

if (!global.__universalEvents) {
  global.__universalEvents = { ...MOCK_STATUS_EVENTS };
}

export async function GET() {
  try {
    // If Supabase is configured with tables, pull live database rows
    if (isSupabaseConfigured()) {
      try {
        const { data: dbPosts, error: postErr } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!postErr && Array.isArray(dbPosts) && dbPosts.length > 0) {
          global.__universalPosts = dbPosts;
        }

        const { data: dbComments, error: commentErr } = await supabase
          .from('comments')
          .select('*')
          .order('created_at', { ascending: true });

        if (!commentErr && Array.isArray(dbComments)) {
          const grouped: Record<string, PostComment[]> = {};
          dbComments.forEach((c: any) => {
            if (!grouped[c.post_id]) grouped[c.post_id] = [];
            grouped[c.post_id].push(c);
          });
          global.__universalComments = { ...global.__universalComments, ...grouped };
        }
      } catch (dbErr) {
        console.warn('[Sync API] Supabase query warning, using global cache:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        posts: global.__universalPosts,
        comments: global.__universalComments,
        events: global.__universalEvents,
        source: isSupabaseConfigured() ? 'supabase-cloud-db' : 'universal-server-state',
        timestamp: new Date().toISOString(),
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { action, post, postId, comment, commentId, delta, remark, status } = payload;

    if (!global.__universalPosts) global.__universalPosts = [...INITIAL_POSTS];
    if (!global.__universalComments) global.__universalComments = {};
    if (!global.__universalEvents) global.__universalEvents = { ...MOCK_STATUS_EVENTS };

    if (action === 'create_post' && post) {
      // Prepend to universal posts
      global.__universalPosts = [post, ...global.__universalPosts.filter(p => p.id !== post.id)];

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('posts').insert(post);
        } catch (dbErr) {
          console.warn('[Sync API] Supabase insert post error:', dbErr);
        }
      }

      return NextResponse.json({ success: true, post });
    }

    if (action === 'delete_post' && postId) {
      global.__universalPosts = global.__universalPosts.filter(p => String(p.id) !== String(postId));
      delete global.__universalComments[postId];

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('posts').delete().eq('id', postId);
          await supabase.from('comments').delete().eq('post_id', postId);
        } catch (dbErr) {
          console.warn('[Sync API] Supabase delete post error:', dbErr);
        }
      }

      return NextResponse.json({ success: true, deletedPostId: postId });
    }

    if (action === 'create_comment' && comment && comment.post_id) {
      const pid = comment.post_id;
      if (!global.__universalComments[pid]) global.__universalComments[pid] = [];
      global.__universalComments[pid] = [comment, ...global.__universalComments[pid]];

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('comments').insert(comment);
        } catch (dbErr) {
          console.warn('[Sync API] Supabase insert comment error:', dbErr);
        }
      }

      return NextResponse.json({ success: true, comment });
    }

    if (action === 'delete_comment' && postId && commentId) {
      if (global.__universalComments[postId]) {
        global.__universalComments[postId] = global.__universalComments[postId].filter(c => c.id !== commentId);
      }

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('comments').delete().eq('id', commentId);
        } catch (dbErr) {
          console.warn('[Sync API] Supabase delete comment error:', dbErr);
        }
      }

      return NextResponse.json({ success: true, deletedCommentId: commentId });
    }

    if (action === 'vote_post' && postId && typeof delta === 'number') {
      global.__universalPosts = global.__universalPosts.map(p => {
        if (String(p.id) !== String(postId)) return p;
        const newAgree = delta === 1 ? p.agree_count + 1 : Math.max(0, p.agree_count - 1);
        return {
          ...p,
          agree_count: newAgree,
          net_votes: newAgree - p.disagree_count,
        };
      });

      if (isSupabaseConfigured()) {
        try {
          const target = global.__universalPosts.find(p => String(p.id) === String(postId));
          if (target) {
            await supabase.from('posts').update({ agree_count: target.agree_count }).eq('id', postId);
          }
        } catch (dbErr) {
          console.warn('[Sync API] Supabase update vote error:', dbErr);
        }
      }

      return NextResponse.json({ success: true, postId });
    }

    if (action === 'resolve_post' && postId) {
      global.__universalPosts = global.__universalPosts.map(p => {
        if (String(p.id) !== String(postId)) return p;
        return {
          ...p,
          status: status || 'resolved',
          resolved_at: new Date().toISOString(),
          admin_note: remark || p.admin_note || 'Resolved by campus administrator.'
        };
      });

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('posts').update({
            status: status || 'resolved',
            resolved_at: new Date().toISOString(),
            admin_note: remark || 'Resolved by campus administrator.'
          }).eq('id', postId);
        } catch (dbErr) {
          console.warn('[Sync API] Supabase update status error:', dbErr);
        }
      }

      return NextResponse.json({ success: true, postId });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
