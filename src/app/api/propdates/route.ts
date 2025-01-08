import { createPropDate, updatePropDate } from '@/services/supabase/propdates';
import {
  createProposal,
  fetchProposalById,
  validateProposalExists,
} from '@/services/supabase/proposals';
import {
  createUser,
  fetchUserByAddress,
  validateUserExists,
} from '@/services/supabase/users';
import { DAO_ADDRESSES } from '@/utils/constants';
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

    const dbAuthor = await validateUserExists(author);
    if (!dbAuthor) {
      await createUser({ e_address: author });
    }

    const dbPropDate = await validateProposalExists(proposal);
    if (!dbPropDate) {
      await createProposal({
        id: proposal,
        dao: DAO_ADDRESSES.token,
        proposer: author,
      });
    }

    const { success, error, data } = await createPropDate(propDate);

    if (!success) {
      return NextResponse.json(
        { error: error?.message || 'Failed to create propdate' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { propdate, text } = await request.json();
    if (!propdate || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    const { success, error } = await updatePropDate({
      id: propdate,
      text,
    });

    if (!success) {
      return NextResponse.json(
        { error: error?.message || 'Failed to update propdate' },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
