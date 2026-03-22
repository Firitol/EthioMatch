import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let query = `SELECT * FROM matches WHERE user_id = '${userId}'`;
    if (status) {
      query += ` AND status = '${status}'`;
    }
    query += ' ORDER BY created_at DESC';

    const result = await sql.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, matchedUserId, status } = body;

    if (!userId || !matchedUserId || !status) {
      return NextResponse.json(
        { error: 'userId, matchedUserId, and status are required' },
        { status: 400 }
      );
    }

    // Check if match already exists
    const existingResult = await sql`
      SELECT * FROM matches 
      WHERE user_id = ${userId} AND matched_user_id = ${matchedUserId}
    `;

    if (existingResult.rows.length > 0) {
      // Update existing match
      const updateResult = await sql`
        UPDATE matches 
        SET status = ${status}
        WHERE user_id = ${userId} AND matched_user_id = ${matchedUserId}
        RETURNING *
      `;
      return NextResponse.json(updateResult.rows[0]);
    }

    // Create new match
    const createResult = await sql`
      INSERT INTO matches (user_id, matched_user_id, status, created_at)
      VALUES (${userId}, ${matchedUserId}, ${status}, NOW())
      RETURNING *
    `;

    // When liking someone, create a conversation immediately
    if (status === 'liked') {
      try {
        const convResult = await sql`
          INSERT INTO conversations (participants, created_at)
          VALUES (ARRAY[${userId}, ${matchedUserId}], NOW())
          ON CONFLICT DO NOTHING
          RETURNING *
        `;
      } catch (convError) {
        console.log('Conversation may already exist:', convError);
      }
    }

    return NextResponse.json(createResult.rows[0]);
  } catch (error) {
    console.error('Failed to create match:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}
