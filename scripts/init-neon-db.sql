-- Ethiomatch PostgreSQL Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  relationship_goal TEXT NOT NULL CHECK (relationship_goal IN ('marriage', 'serious', 'dating')),
  bio TEXT,
  location TEXT NOT NULL,
  tokens INTEGER DEFAULT 10,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at BIGINT,
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  participant_1 TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2 TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  CONSTRAINT different_participants CHECK (participant_1 < participant_2)
);

CREATE INDEX IF NOT EXISTS conversations_participant_1_idx ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS conversations_participant_2_idx ON conversations(participant_2);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IS NULL OR media_type IN ('image', 'video')),
  is_read BOOLEAN DEFAULT false,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('liked', 'disliked', 'matched')),
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS matches_user_id_idx ON matches(user_id);
CREATE INDEX IF NOT EXISTS matches_matched_user_id_idx ON matches(matched_user_id);
CREATE INDEX IF NOT EXISTS matches_status_idx ON matches(status);

-- Create unique constraint to prevent duplicate matches
CREATE UNIQUE INDEX IF NOT EXISTS matches_unique_idx ON matches(user_id, matched_user_id);
