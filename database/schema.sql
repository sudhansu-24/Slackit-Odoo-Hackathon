-- StackIt Q&A Platform Database Schema
-- Run this entire script in Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tags TEXT[] NOT NULL DEFAULT '{}',
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_author_id ON public.questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON public.answers(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON public.answers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_target_id ON public.votes(target_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for questions table
CREATE POLICY "Questions are viewable by everyone" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert questions" ON public.questions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own questions" ON public.questions
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own questions" ON public.questions
    FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for answers table
CREATE POLICY "Answers are viewable by everyone" ON public.answers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert answers" ON public.answers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own answers" ON public.answers
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own answers" ON public.answers
    FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for votes table
CREATE POLICY "Votes are viewable by everyone" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.votes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own votes" ON public.votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.votes
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update vote count for questions or answers
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'question' THEN
            UPDATE public.questions 
            SET votes = votes + CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE -1 END
            WHERE id = NEW.target_id;
        ELSE
            UPDATE public.answers 
            SET votes = votes + CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE -1 END
            WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.target_type = 'question' THEN
            UPDATE public.questions 
            SET votes = votes + CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE -1 END
                              - CASE WHEN OLD.vote_type = 'upvote' THEN 1 ELSE -1 END
            WHERE id = NEW.target_id;
        ELSE
            UPDATE public.answers 
            SET votes = votes + CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE -1 END
                              - CASE WHEN OLD.vote_type = 'upvote' THEN 1 ELSE -1 END
            WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'question' THEN
            UPDATE public.questions 
            SET votes = votes - CASE WHEN OLD.vote_type = 'upvote' THEN 1 ELSE -1 END
            WHERE id = OLD.target_id;
        ELSE
            UPDATE public.answers 
            SET votes = votes - CASE WHEN OLD.vote_type = 'upvote' THEN 1 ELSE -1 END
            WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update vote counts
CREATE OR REPLACE TRIGGER on_vote_change
    AFTER INSERT OR UPDATE OR DELETE ON public.votes
    FOR EACH ROW EXECUTE FUNCTION public.update_vote_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER update_answers_updated_at
    BEFORE UPDATE ON public.answers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert sample data for testing (optional)
-- Uncomment the following lines to insert sample data

/*
-- Sample users (these would be created through auth, but for testing)
INSERT INTO public.profiles (id, username) VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'john_doe'),
    ('123e4567-e89b-12d3-a456-426614174001', 'jane_smith'),
    ('123e4567-e89b-12d3-a456-426614174002', 'tech_guru')
ON CONFLICT (id) DO NOTHING;

-- Sample questions
INSERT INTO public.questions (id, title, description, author_id, tags) VALUES
    ('456e7890-e89b-12d3-a456-426614174000', 'How to implement authentication in Next.js?', 'I need help implementing authentication in my Next.js application with Supabase.', '123e4567-e89b-12d3-a456-426614174000', ARRAY['nextjs', 'authentication', 'supabase']),
    ('456e7890-e89b-12d3-a456-426614174001', 'React state management best practices', 'What are the best practices for managing state in large React applications?', '123e4567-e89b-12d3-a456-426614174001', ARRAY['react', 'state-management', 'best-practices']),
    ('456e7890-e89b-12d3-a456-426614174002', 'Database design for Q&A platform', 'How should I design a database schema for a Q&A platform like Stack Overflow?', '123e4567-e89b-12d3-a456-426614174002', ARRAY['database', 'schema', 'postgresql'])
ON CONFLICT (id) DO NOTHING;

-- Sample answers
INSERT INTO public.answers (id, question_id, author_id, content, is_accepted) VALUES
    ('789e0123-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001', 'You can use Supabase Auth with Next.js by installing @supabase/supabase-js and setting up the client configuration.', true),
    ('789e0123-e89b-12d3-a456-426614174001', '456e7890-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002', 'For large React applications, consider using Context API with useReducer or external libraries like Redux Toolkit.', false),
    ('789e0123-e89b-12d3-a456-426614174002', '456e7890-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'You should normalize your data with separate tables for users, questions, answers, and votes with proper relationships.', true)
ON CONFLICT (id) DO NOTHING;
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 