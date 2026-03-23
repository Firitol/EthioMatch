import { NextRequest, NextResponse } from 'next/server';
import { query as sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    // Validation
    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find user by email and update password
    try {
      const userResult = await sql`
        SELECT * FROM users WHERE LOWER(email) = LOWER(${email})
      `;

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'No account found with this email address' },
          { status: 404 }
        );
      }

      const user = userResult.rows[0];

      // Update password
      const updateResult = await sql`
        UPDATE users 
        SET password = ${newPassword}, updated_at = NOW()
        WHERE id = ${user.id}
        RETURNING id, email, name
      `;

      if (updateResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Failed to update password' },
          { status: 500 }
        );
      }

      console.log('[v0] Password reset successful for:', email);
      return NextResponse.json({
        message: 'Password reset successfully',
        user: updateResult.rows[0],
      });
    } catch (dbError) {
      console.error('[v0] Database error in password reset:', dbError);
      // Return service unavailable for database errors
      return NextResponse.json(
        { error: 'Database service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('[v0] Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred during password reset' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
