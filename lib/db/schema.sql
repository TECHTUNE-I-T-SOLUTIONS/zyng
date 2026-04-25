
-- Zyng Core Schema MVP

-- 1. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    campus_id TEXT NOT NULL,
    trust_score INTEGER DEFAULT 100,
    security_question TEXT NOT NULL,
    security_answer_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Personas (Public-facing identity)
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    reputation_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Posts (Unified system)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
    campus_id TEXT NOT NULL,
    post_type TEXT NOT NULL, -- 'regular', 'confession', 'poll', 'hot_take', 'missed_connection'
    content TEXT,
    media_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS setup (Example policies)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies here are placeholders for actual implementation.
-- They MUST be tightened for production.
