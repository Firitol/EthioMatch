import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    const action = searchParams.get('action');

    if (action === 'all') {
      // Get all users
      const result = await sql`
        SELECT id, name, age, gender, bio, photos, interests, location, relationship_goal, created_at
        FROM users
        ORDER BY created_at DESC
      `;
      return NextResponse.json(result.rows);
    }

    if (userId) {
      // Get single user
      const result = await sql`
        SELECT * FROM users WHERE id = ${userId}
      `;
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json(result.rows[0]);
    }

    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Build dynamic update query
    const allowedFields = ['name', 'bio', 'photos', 'interests', 'tokens', 'is_premium'];
    const updateFields: string[] = [];
    const values: (string | number | boolean | string[] | null)[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    const result = await sql`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
