import { createPropDate } from '@/services/supabase/propdates';
import { PropDateInsert } from '@/utils/database/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposal, text, author } = body;

    if (!proposal || !text || !author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const propDate: PropDateInsert = {
      proposal,
      text,
      author,
    };

    const { success, error } = await createPropDate(propDate);

    if (!success) {
      return NextResponse.json(
        { error: error?.message || 'Failed to create propdate' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
