import { sql } from '@neondatabase/serverless';
import { User, Match, Message, Conversation } from './db';

// Database helper functions using Neon serverless PostgreSQL

export async function registerUser(
  email: string,
  password: string,
  name: string,
  age: number,
  gender: 'male' | 'female',
  relationshipGoal: 'marriage' | 'serious' | 'dating',
  location: string,
  bio?: string
): Promise<User | null> {
  try {
    const userId = `user-${Date.now()}`;
    const now = Date.now();

    const result = await sql`
      INSERT INTO users (
        id, email, password, name, age, gender, 
        relationship_goal, location, bio, tokens, 
        is_premium, created_at, updated_at
      ) VALUES (
        ${userId}, ${email.toLowerCase()}, ${password}, ${name}, ${age}, 
        ${gender}, ${relationshipGoal}, ${location}, ${bio || 'Hello! I am new to Ethiomatch.'}, 
        10, false, ${now}, ${now}
      )
      RETURNING id, email, name, age, gender, relationship_goal, bio, 
               location, tokens, is_premium, created_at, photos, videos, interests;
    `;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        password: password,
        name: row.name,
        age: row.age,
        gender: row.gender,
        relationshipGoal: row.relationship_goal,
        bio: row.bio,
        location: row.location,
        tokens: row.tokens,
        isPremium: row.is_premium,
        photos: row.photos || [],
        videos: row.videos || [],
        interests: row.interests || [],
        createdAt: row.created_at,
      };
    }
    return null;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, age, gender, relationship_goal, bio, 
             location, tokens, is_premium, premium_expires_at, created_at, 
             photos, videos, interests
      FROM users
      WHERE email = ${email.toLowerCase()} AND password = ${password}
      LIMIT 1;
    `;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        password: password,
        name: row.name,
        age: row.age,
        gender: row.gender,
        relationshipGoal: row.relationship_goal,
        bio: row.bio,
        location: row.location,
        tokens: row.tokens,
        isPremium: row.is_premium,
        premiumExpiresAt: row.premium_expires_at,
        photos: row.photos || [],
        videos: row.videos || [],
        interests: row.interests || [],
        createdAt: row.created_at,
      };
    }
    return null;
  } catch (error) {
    console.error('Error logging in user:', error);
    return null;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, age, gender, relationship_goal, bio, 
             location, tokens, is_premium, premium_expires_at, created_at, 
             photos, videos, interests
      FROM users
      WHERE id = ${userId}
      LIMIT 1;
    `;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        password: '', // Don't return password
        name: row.name,
        age: row.age,
        gender: row.gender,
        relationshipGoal: row.relationship_goal,
        bio: row.bio,
        location: row.location,
        tokens: row.tokens,
        isPremium: row.is_premium,
        premiumExpiresAt: row.premium_expires_at,
        photos: row.photos || [],
        videos: row.videos || [],
        interests: row.interests || [],
        createdAt: row.created_at,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await sql`
      SELECT id, email, name, age, gender, relationship_goal, bio, 
             location, tokens, is_premium, premium_expires_at, created_at, 
             photos, videos, interests
      FROM users
      ORDER BY created_at DESC;
    `;

    return result.rows.map(row => ({
      id: row.id,
      email: row.email,
      password: '',
      name: row.name,
      age: row.age,
      gender: row.gender,
      relationshipGoal: row.relationship_goal,
      bio: row.bio,
      location: row.location,
      tokens: row.tokens,
      isPremium: row.is_premium,
      premiumExpiresAt: row.premium_expires_at,
      photos: row.photos || [],
      videos: row.videos || [],
      interests: row.interests || [],
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.tokens !== undefined) {
      fields.push(`tokens = $${fields.length + 1}`);
      values.push(updates.tokens);
    }
    if (updates.isPremium !== undefined) {
      fields.push(`is_premium = $${fields.length + 1}`);
      values.push(updates.isPremium);
    }
    if (updates.premiumExpiresAt !== undefined) {
      fields.push(`premium_expires_at = $${fields.length + 1}`);
      values.push(updates.premiumExpiresAt);
    }
    if (updates.bio !== undefined) {
      fields.push(`bio = $${fields.length + 1}`);
      values.push(updates.bio);
    }
    if (updates.photos !== undefined) {
      fields.push(`photos = $${fields.length + 1}`);
      values.push(updates.photos);
    }
    if (updates.videos !== undefined) {
      fields.push(`videos = $${fields.length + 1}`);
      values.push(updates.videos);
    }
    if (updates.interests !== undefined) {
      fields.push(`interests = $${fields.length + 1}`);
      values.push(updates.interests);
    }

    if (fields.length === 0) return getUserById(userId);

    fields.push(`updated_at = ${now}`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${fields.length}
      RETURNING id, email, name, age, gender, relationship_goal, bio, 
               location, tokens, is_premium, premium_expires_at, created_at, 
               photos, videos, interests;
    `;

    const result = await sql.query(query, values);

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        password: '',
        name: row.name,
        age: row.age,
        gender: row.gender,
        relationshipGoal: row.relationship_goal,
        bio: row.bio,
        location: row.location,
        tokens: row.tokens,
        isPremium: row.is_premium,
        premiumExpiresAt: row.premium_expires_at,
        photos: row.photos || [],
        videos: row.videos || [],
        interests: row.interests || [],
        createdAt: row.created_at,
      };
    }
    return null;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

export async function useToken(userId: string): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE users 
      SET tokens = tokens - 1, updated_at = ${Date.now()}
      WHERE id = ${userId} AND tokens > 0 AND is_premium = false
      RETURNING tokens;
    `;

    return result.rows.length > 0 && result.rows[0].tokens >= 0;
  } catch (error) {
    console.error('Error using token:', error);
    return false;
  }
}

export async function upgradeToPremium(userId: string): Promise<User | null> {
  const now = Date.now();
  const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days

  return updateUser(userId, {
    isPremium: true,
    premiumExpiresAt: expiresAt,
  } as Partial<User>);
}

export async function addTokens(userId: string, amount: number): Promise<User | null> {
  try {
    const result = await sql`
      UPDATE users 
      SET tokens = tokens + ${amount}, updated_at = ${Date.now()}
      WHERE id = ${userId}
      RETURNING tokens;
    `;

    if (result.rows.length > 0) {
      return getUserById(userId);
    }
    return null;
  } catch (error) {
    console.error('Error adding tokens:', error);
    return null;
  }
}

// Conversation functions
export async function findOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<Conversation | null> {
  try {
    const participants = [userId1, userId2].sort();
    const [p1, p2] = participants;

    // Try to find existing conversation
    let result = await sql`
      SELECT id, participant_1, participant_2, created_at
      FROM conversations
      WHERE (participant_1 = ${p1} AND participant_2 = ${p2})
      LIMIT 1;
    `;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        participants: [row.participant_1, row.participant_2],
        createdAt: row.created_at,
      };
    }

    // Create new conversation
    const conversationId = `conv-${Date.now()}`;
    const now = Date.now();

    await sql`
      INSERT INTO conversations (id, participant_1, participant_2, created_at, updated_at)
      VALUES (${conversationId}, ${p1}, ${p2}, ${now}, ${now});
    `;

    return {
      id: conversationId,
      participants: [p1, p2],
      createdAt: now,
    };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    const result = await sql`
      SELECT id, participant_1, participant_2, created_at
      FROM conversations
      WHERE participant_1 = ${userId} OR participant_2 = ${userId}
      ORDER BY created_at DESC;
    `;

    return result.rows.map(row => ({
      id: row.id,
      participants: [row.participant_1, row.participant_2],
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

// Message functions
export async function createMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'video'
): Promise<Message | null> {
  try {
    const messageId = `msg-${Date.now()}-${Math.random()}`;
    const now = Date.now();

    await sql`
      INSERT INTO messages (
        id, conversation_id, sender_id, receiver_id, content, 
        media_url, media_type, is_read, created_at
      ) VALUES (
        ${messageId}, ${conversationId}, ${senderId}, ${receiverId}, 
        ${content}, ${mediaUrl || null}, ${mediaType || null}, false, ${now}
      );
    `;

    return {
      id: messageId,
      conversationId,
      senderId,
      receiverId,
      content,
      mediaUrl,
      mediaType,
      createdAt: now,
      read: false,
    };
  } catch (error) {
    console.error('Error creating message:', error);
    return null;
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const result = await sql`
      SELECT id, conversation_id, sender_id, receiver_id, content, 
             media_url, media_type, is_read, created_at
      FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC;
    `;

    return result.rows.map(row => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      mediaUrl: row.media_url,
      mediaType: row.media_type,
      createdAt: row.created_at,
      read: row.is_read,
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  try {
    await sql`
      UPDATE messages
      SET is_read = true
      WHERE conversation_id = ${conversationId} AND receiver_id = ${userId};
    `;
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}

// Match functions
export async function createMatch(
  userId: string,
  matchedUserId: string,
  status: 'liked' | 'disliked' | 'matched'
): Promise<Match | null> {
  try {
    const matchId = `match-${userId}-${matchedUserId}-${Date.now()}`;
    const now = Date.now();

    await sql`
      INSERT INTO matches (id, user_id, matched_user_id, status, created_at)
      VALUES (${matchId}, ${userId}, ${matchedUserId}, ${status}, ${now});
    `;

    return {
      id: matchId,
      userId,
      matchedUserId,
      status,
      createdAt: now,
    };
  } catch (error) {
    console.error('Error creating match:', error);
    return null;
  }
}

export async function getMatches(userId: string): Promise<Match[]> {
  try {
    const result = await sql`
      SELECT id, user_id, matched_user_id, status, created_at
      FROM matches
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      matchedUserId: row.matched_user_id,
      status: row.status,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error getting matches:', error);
    return [];
  }
}

export async function getAllMatches(): Promise<Match[]> {
  try {
    const result = await sql`
      SELECT id, user_id, matched_user_id, status, created_at
      FROM matches
      ORDER BY created_at DESC;
    `;

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      matchedUserId: row.matched_user_id,
      status: row.status,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error getting all matches:', error);
    return [];
  }
}

export async function updateMatch(matchId: string, status: 'liked' | 'disliked' | 'matched'): Promise<Match | null> {
  try {
    const result = await sql`
      UPDATE matches
      SET status = ${status}
      WHERE id = ${matchId}
      RETURNING id, user_id, matched_user_id, status, created_at;
    `;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        matchedUserId: row.matched_user_id,
        status: row.status,
        createdAt: row.created_at,
      };
    }
    return null;
  } catch (error) {
    console.error('Error updating match:', error);
    return null;
  }
}
