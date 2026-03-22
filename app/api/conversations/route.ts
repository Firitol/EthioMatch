import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT c.*, 
        u1.name as user1_name, u1.photos as user1_photos,
        u2.name as user2_name, u2.photos as user2_photos
      FROM conversations c
      LEFT JOIN users u1 ON c.participants[1] = u1.id
      LEFT JOIN users u2 ON c.participants[2] = u2.id
      WHERE ${userId} = ANY(c.participants)
      ORDER BY c.last_message_time DESC NULLS LAST
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId1, userId2 } = body;

    if (!userId1 || !userId2) {
      return NextResponse.json(
        { error: 'userId1 and userId2 are required' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingResult = await sql`
      SELECT * FROM conversations 
      WHERE participants @> ARRAY[${userId1}, ${userId2}]
    `;

    if (existingResult.rows.length > 0) {
      return NextResponse.json(existingResult.rows[0]);
    }

    // Create new conversation
    const result = await sql`
      INSERT INTO conversations (participants, created_at)
      VALUES (ARRAY[${userId1}, ${userId2}], NOW())
      RETURNING *
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
