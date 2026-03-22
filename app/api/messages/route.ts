import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT * FROM messages 
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      senderId,
      receiverId,
      content,
      mediaUrl,
      mediaType,
    } = body;

    if (!conversationId || !senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has tokens or is premium
    const userResult = await sql`
      SELECT tokens, is_premium FROM users WHERE id = ${senderId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    
    if (!user.is_premium && user.tokens <= 0) {
      return NextResponse.json(
        { error: 'Insufficient tokens' },
        { status: 403 }
      );
    }

    // Deduct token if not premium
    if (!user.is_premium) {
      await sql`
        UPDATE users SET tokens = tokens - 1 WHERE id = ${senderId}
      `;
    }

    // Create message
    const messageResult = await sql`
      INSERT INTO messages (conversation_id, sender_id, receiver_id, content, media_url, media_type, created_at, read)
      VALUES (${conversationId}, ${senderId}, ${receiverId}, ${content}, ${mediaUrl || null}, ${mediaType || null}, NOW(), false)
      RETURNING *
    `;

    // Update conversation last message
    await sql`
      UPDATE conversations 
      SET last_message = ${content}, last_message_time = NOW()
      WHERE id = ${conversationId}
    `;

    return NextResponse.json(messageResult.rows[0]);
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, userId } = body;

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'conversationId and userId are required' },
        { status: 400 }
      );
    }

    // Mark messages as read
    await sql`
      UPDATE messages 
      SET read = true
      WHERE conversation_id = ${conversationId} AND receiver_id = ${userId} AND read = false
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
