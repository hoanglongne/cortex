import { 
  AssessmentMetrics, 
  AppSource 
} from '@cortex/types';
import { Ratings } from '../types';

/**
 * SOLILO Mapper Utility
 * Bridges local data models with @cortex/types shared models
 */

export const SOLILO_SOURCE: AppSource = 'solilo';

/**
 * Maps Solilo Ratings to Shared AssessmentMetrics
 */
export const mapSoliloRatingsToMetrics = (ratings: Ratings): AssessmentMetrics => {
  return {
    fluency: ratings.fluency || 0,
    vocabulary: ratings.lexical || 0, // Mapping 'lexical' to 'vocabulary'
    grammar: ratings.grammar || 0,
    pronunciation: ratings.pronunciation || 0,
    overall: calculateOverall(ratings)
  };
};

/**
 * Internal helper to calculate overall score if not provided
 */
function calculateOverall(ratings: Ratings): number {
  const values = [
    ratings.fluency,
    ratings.lexical,
    ratings.grammar,
    ratings.pronunciation
  ].filter((v): v is number => v !== null);

  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}
