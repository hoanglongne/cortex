import { 
  ProficiencyLevel, 
  AssessmentMetrics, 
  User,
  AppSource
} from '@cortex/types';
import { 
  Profile, 
  SessionScores, 
  IeltsQuestion 
} from '../types/database';

/**
 * ORATIO Mapper Utility
 * Bridges local data models with @cortex/types shared models
 */

export const ORATIO_SOURCE: AppSource = 'oratio';

/**
 * Maps Oratio difficulty to Shared ProficiencyLevel
 */
export const mapOratioDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): ProficiencyLevel => {
  const mapping: Record<string, ProficiencyLevel> = {
    'easy': 'beginner',
    'medium': 'intermediate',
    'hard': 'advanced'
  };
  return mapping[difficulty] || 'intermediate';
};

/**
 * Maps Oratio SessionScores to Shared AssessmentMetrics
 */
export const mapOratioScoresToMetrics = (scores: SessionScores): AssessmentMetrics => {
  return {
    fluency: scores.fluency,
    vocabulary: scores.vocabulary,
    grammar: scores.grammar,
    pronunciation: scores.pronunciation,
    overall: scores.overall,
    bandScore: scores.overall // In Oratio, overall is usually the band score
  };
};

/**
 * Maps Oratio Profile to Shared User
 */
export const mapOratioProfileToUser = (profile: Profile): User => {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email || '',
    avatarUrl: profile.avatar_url || undefined,
    targetBand: profile.target_band,
    currentBand: profile.current_band,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at)
  };
};
