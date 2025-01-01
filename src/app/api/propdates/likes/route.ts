import {
  createLike,
  deleteLike,
  fetchLikeById,
} from '@/services/supabase/likes';
import { createUser, validateUserExists } from '@/services/supabase/users';
import { LikeInsert } from '@/utils/database/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propdate, user } = body;

    if (!propdate || !user) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dbAuthor = await validateUserExists(user);
    if (!dbAuthor) {
      await createUser({ e_address: user });
    }

    const like: LikeInsert = {
      propdate,
      user,
    };

    let success = false;
    const dbLike = await fetchLikeById(like.propdate, like.user);

    if (dbLike.data) {
      success = await deleteLike(like.propdate, like.user);
    } else {
      success = await createLike(like);
    }

    if (!success) {
      return NextResponse.json(
        { error: `Failed to ${dbLike ? 'delete' : 'create'} like` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Like ${dbLike ? 'deleted' : 'created'}`,
        created: !dbLike,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json('Internal server error', { status: 500 });
  }
}
