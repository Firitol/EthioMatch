import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Fallback function to use in-memory/local database
async function getUserFromLocalDb(userId: string) {
  // This would be implemented if using a localStorage-like backend
  // For now, return null to indicate database not available
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    const action = searchParams.get('action');

    if (action === 'all') {
      // Get all users
      try {
        const result = await sql`
          SELECT id, name, age, gender, bio, photos, interests, location, relationship_goal, created_at
          FROM users
          ORDER BY created_at DESC
        `;
        return NextResponse.json(result.rows);
      } catch (dbError) {
        console.error('[v0] Database error fetching all users:', dbError);
        return NextResponse.json(
          { error: 'Failed to fetch users from database' },
          { status: 503 }
        );
      }
    }

    if (userId) {
      // Get single user
      try {
        const result = await sql`
          SELECT * FROM users WHERE id = ${userId}
        `;
        
        if (result.rows.length === 0) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json(result.rows[0]);
      } catch (dbError) {
        console.error('[v0] Database error fetching user:', dbError);
        // Fallback: return basic error response
        return NextResponse.json(
          { error: 'Failed to fetch user from database' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'userId or action parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[v0] Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching users' },
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
    const allowedFields = ['name', 'bio', 'photos', 'interests', 'tokens', 'is_premium', 'isPremium'];
    const mappedUpdates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
      // Map camelCase to snake_case for database
      let dbKey = key;
      if (key === 'isPremium') dbKey = 'is_premium';
      
      if (allowedFields.includes(key) || allowedFields.includes(dbKey)) {
        mappedUpdates[dbKey] = value;
      }
    }

    if (Object.keys(mappedUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    try {
      const result = await sql`
        UPDATE users 
        SET ${Object.entries(mappedUpdates).map(([key, _], index) => `${key} = $${index + 1}`).join(', ')}
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    } catch (dbError) {
      console.error('[v0] Database error updating user:', dbError);
      return NextResponse.json(
        { error: 'Failed to update user in database' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('[v0] Failed to update user:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating user' },
      { status: 500 }
    );
  }
}
