// ============================================
// Database Types for ORATIO (formerly SpeakMate)
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// Enums
// ============================================

export type MatchQueueStatus = "waiting" | "matched" | "cancelled";
export type MatchStatus = "pending" | "active" | "finished" | "cancelled";

// ============================================
// Table Row Types
// ============================================

export interface Profile {
  id: string;
  username: string;
  email?: string;
  target_band: number;
  current_band: number;
  avatar_url: string | null;
  native_language: string | null;
  country: string | null;
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchQueueEntry {
  id: string;
  user_id: string;
  target_band_min: number;
  target_band_max: number;
  status: MatchQueueStatus;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  interviewer_id: string | null;
  candidate_id: string | null;
  swap_requested_by: string | null;
  room_id: string;
  status: MatchStatus;
  topic: string | null;
  current_question_id: string | null;
  questions_asked: string[];
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface IeltsQuestion {
  id: string;
  part: number;
  category: string;
  question_text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface SessionFeedback {
  id: string;
  match_id: string;
  from_user_id: string;
  to_user_id: string;
  overall_rating: number;
  would_match_again: boolean | null;
  feedback_tags: string[];
  comments: string | null;
  scores: SessionScores | null;
  created_at: string;
}

export interface SessionScores {
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  overall: number;
}

// ============================================
// Insert Types (for creating new records)
// ============================================

export interface ProfileInsert {
  id: string;
  username: string;
  email?: string;
  target_band?: number;
  current_band?: number;
  avatar_url?: string | null;
  native_language?: string | null;
  country?: string | null;
}

export interface MatchQueueInsert {
  user_id: string;
  target_band_min?: number;
  target_band_max?: number;
  status?: MatchQueueStatus;
}

export interface MatchInsert {
  user1_id: string;
  user2_id: string;
  room_id: string;
  status?: MatchStatus;
  topic?: string | null;
}

export interface SessionFeedbackInsert {
  match_id: string;
  from_user_id: string;
  to_user_id: string;
  overall_rating: number;
  would_match_again?: boolean | null;
  feedback_tags?: string[];
  comments?: string | null;
  scores?: SessionScores | null;
}

// ============================================
// Update Types
// ============================================

export interface ProfileUpdate {
  username?: string;
  target_band?: number;
  current_band?: number;
  avatar_url?: string | null;
  native_language?: string | null;
  country?: string | null;
  total_sessions?: number;
  total_minutes?: number;
  current_streak?: number;
  longest_streak?: number;
  last_practice_date?: string | null;
  updated_at?: string;
}

export interface MatchQueueUpdate {
  status?: MatchQueueStatus;
}

export interface MatchUpdate {
  status?: MatchStatus;
  topic?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
}

// ============================================
// Joined/Extended Types
// ============================================

export interface MatchWithProfiles extends Match {
  user1: Profile;
  user2: Profile;
}

export interface MatchQueueWithProfile extends MatchQueueEntry {
  profile: Profile;
}

// ============================================
// API Response Types
// ============================================

export interface FindMatchResult {
  status: "matched" | "waiting" | "error";
  roomId?: string;
  matchId?: string;
  partner?: {
    id: string;
    username: string;
    band: number;
    avatarUrl: string | null;
  };
  error?: string;
  logs?: string[]; // Added for debugging
}

export interface LiveKitTokenResult {
  token: string;
  roomName: string;
}

// ============================================
// Database Schema Type (for Supabase client)
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      match_queue: {
        Row: MatchQueueEntry;
        Insert: MatchQueueInsert;
        Update: MatchQueueUpdate;
      };
      matches: {
        Row: Match;
        Insert: MatchInsert;
        Update: MatchUpdate;
      };
      session_feedback: {
        Row: SessionFeedback;
        Insert: SessionFeedbackInsert;
        Update: Partial<SessionFeedbackInsert>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      match_queue_status: MatchQueueStatus;
      match_status: MatchStatus;
    };
  };
}

