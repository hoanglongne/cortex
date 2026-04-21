import { 
  ProficiencyLevel, 
  LinguisticProfile, 
  AppSource 
} from '@cortex/types';
import { UserStats } from './eloAlgorithm';
import { DifficultyLevel } from '../components/VocabCard';

/**
 * LEXICA Mapper Utility
 * Bridges local data models with @cortex/types shared models
 */

export const LEXICA_SOURCE: AppSource = 'lexica';

/**
 * Maps Lexica DifficultyLevel to Shared ProficiencyLevel
 */
export const mapLexicaLevel = (level: DifficultyLevel): ProficiencyLevel => {
  // Lexica uses 'beginner' | 'intermediate' | 'advanced' | 'expert'
  // which matches ProficiencyLevel exactly
  return level;
};

/**
 * Maps Lexica UserStats to Shared LinguisticProfile
 */
export const mapLexicaStatsToProfile = (userId: string, stats: UserStats): LinguisticProfile => {
  return {
    userId,
    fluencyElo: stats.currentElo, // Lexica ELO is mainly vocab-based but contributes to general fluency
    vocabElo: stats.currentElo,
    logicElo: 1000, // Default for now
    reflexElo: 1000, // Default for now
    lastUpdated: new Date()
  };
};
