import { Injectable, Logger } from '@nestjs/common';
import nlp from 'compromise';
import { WordTokenizer } from 'natural';
import { SupabaseService } from '../supabase/supabase.service';

export interface BridgeResult {
  activeCount: number;
  passiveCount: number;
  activationRate: number;
  passiveVocabSamples: string[];
  message?: string;
  error?: string;
}

@Injectable()
export class LinguisticRefinerService {
  private readonly logger = new Logger(LinguisticRefinerService.name);
  private tokenizer = new WordTokenizer();

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Extracts keywords and entities from a text string
   */
  extractInsights(text: string) {
    this.logger.log(
      `Extracting insights from text: ${text.substring(0, 50)}...`,
    );
    const doc = nlp(text);

    const keywords = (doc.terms().out('array') as string[]) || [];
    const nouns = (doc.nouns().out('array') as string[]) || [];
    const verbs = (doc.verbs().out('array') as string[]) || [];
    const topics = (doc.topics().out('array') as string[]) || [];

    return {
      wordCount: keywords.length,
      uniqueWords: Array.from(
        new Set(
          keywords.map((w) =>
            w
              .toLowerCase()
              .replace(/[.,/#!$%^&*:{}=\-_`~()]/g, '')
              .trim(),
          ),
        ),
      ).filter((w) => w.length > 0),
      topics,
      topNouns: nouns.slice(0, 10),
      topVerbs: verbs.slice(0, 10),
    };
  }

  /**
   * Simple fluency analyzer based on text (filler word detection)
   */
  analyzeFluency(text: string) {
    const fillers = ['um', 'uh', 'ah', 'well', 'like', 'actually', 'basically'];
    const words = this.tokenizer.tokenize(text.toLowerCase()) || [];

    const fillerCount = words.filter((w) => fillers.includes(w)).length;
    const fillerRatio = words.length > 0 ? fillerCount / words.length : 0;

    return {
      fillerCount,
      fillerRatio,
      score: Math.max(0, 100 - fillerRatio * 500), // Crude score
    };
  }

  /**
   * Active Vocab Bridge: Compares learned words from Lexica with used words in speaking
   */
  async bridgeVocab(
    userId: string,
    usedWords: string[],
  ): Promise<BridgeResult> {
    this.logger.log(`Bridging vocabulary for user ${userId}`);

    try {
      // 1. Fetch learned words from Lexica (user_vocabulary table)
      const learnedWordsData = (await this.supabaseService.getData(
        'user_vocabulary',
        { userId },
      )) as Array<{ word: string }>;

      // 2. Map of IDs to Words (Lexica database fallback)
      // This maps IDs like 'v001' to their actual English words
      const idToWordMap: Record<string, string> = {
        v001: 'ABUNDANT',
        v002: 'COGNITIVE',
        v003: 'DILEMMA',
        v004: 'FEASIBLE',
        v005: 'INEVITABLE',
        v006: 'PRAGMATIC',
        v007: 'AMBIGUOUS',
        v008: 'RESILIENT',
        v009: 'TEDIOUS',
        v010: 'SUBTLE',
        v011: 'METICULOUS',
        v012: 'UBIQUITOUS',
        v013: 'EPHEMERAL',
        v014: 'ELOQUENT',
        v015: 'PLAUSIBLE',
        v016: 'SCRUTINIZE',
        v017: 'CANDID',
        v018: 'CONTEMPLATE',
        v019: 'MUNDANE',
        v020: 'INHERENT',
        v021: 'CONUNDRUM',
        v022: 'EXACERBATE',
        v023: 'MITIGATE',
        v024: 'NUANCE',
        v025: 'PROLIFIC',
        v026: 'REDUNDANT',
        v027: 'TANGIBLE',
        v028: 'ZENITH',
        v029: 'COHERENT',
        v030: 'ARBITRARY',
        v031: 'BELLIGERENT',
        v032: 'ELUCIDATE',
        v033: 'ESOTERIC',
        v034: 'GREGARIOUS',
        v035: 'IMPETUOUS',
        v036: 'JUXTAPOSE',
        v037: 'MALEVOLENT',
        v038: 'OBFUSCATE',
        v039: 'PARSIMONY',
        v040: 'QUINTESSENTIAL',
        v041: 'RECALCITRANT',
        v042: 'SALIENT',
        v043: 'TACITURN',
        v044: 'VICARIOUS',
        v045: 'ZEALOT',
        v046: 'AMELIORATE',
        v047: 'CACOPHONY',
        v048: 'DOGMATIC',
        v049: 'ENERVATE',
        v050: 'HACKNEYED',
        v051: 'GRANDILOQUENT',
        v052: 'ICONOCLAST',
        v053: 'LACONIC',
        v054: 'OBSEQUIOUS',
        v055: 'PERNICIOUS',
        v056: 'QUIXOTIC',
        v057: 'RISIBLE',
        v058: 'SYCOPHANT',
        v059: 'VITRIOLIC',
        v060: 'ABSTRUSE',
        // Common ones from the log
        v132: 'PROFOUND',
        v121: 'MODICUM',
        v116: 'IMPLICIT',
        v107: 'DETRIMENTAL',
        v101: 'CONTENTIOUS',
        v093: 'ANALOGOUS',
      };

      const learnedWords = learnedWordsData.map((v) => {
        const rawWord = v.word.toLowerCase();
        // If it looks like an ID (v001), try to map it
        if (/^v\d{3}$/.test(rawWord) && rawWord in idToWordMap) {
          return idToWordMap[rawWord].toLowerCase();
        }
        return rawWord.replace(/[.,/#!$%^&*:{}=\-_`~()]/g, '').trim();
      });

      this.logger.log(
        `Found ${learnedWords.length} learned words for user ${userId}`,
      );

      if (learnedWords.length === 0) {
        return {
          activeCount: 0,
          passiveCount: 0,
          activationRate: 0,
          passiveVocabSamples: [],
          message: 'No learned vocabulary found in Lexica',
        };
      }

      // 2. Identify which learned words have been used
      const activeVocab = learnedWords.filter((word) =>
        usedWords.includes(word),
      );
      const passiveVocab = learnedWords.filter(
        (word) => !usedWords.includes(word),
      );

      // 3. Update the bridge status in Supabase (linguistic_profiles) - Removed internal upsert
      // We return the data to the controller to handle a single consolidated upsert
      return {
        activeCount: activeVocab.length,
        passiveCount: passiveVocab.length,
        activationRate: (activeVocab.length / learnedWords.length) * 100,
        passiveVocabSamples: passiveVocab.slice(0, 20),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Vocab bridge failed: ${message}`);
      return {
        activeCount: 0,
        passiveCount: 0,
        activationRate: 0,
        passiveVocabSamples: [],
        error: 'Failed to bridge vocabulary',
      };
    }
  }

  /**
   * Cognitive Load Balancer: Recommends a difficulty level based on performance
   */
  recommendDifficulty(metrics: {
    fluencyScore: number;
    activationRate: number;
  }) {
    const { fluencyScore, activationRate } = metrics;

    let recommendation = 'NORMAL';
    let message = 'Keep practicing at your current pace.';

    if (fluencyScore < 40 || activationRate < 10) {
      recommendation = 'EASY';
      message =
        'Slow down! Let’s focus on simpler sentences and active vocabulary.';
    } else if (fluencyScore > 85 && activationRate > 40) {
      recommendation = 'HARD';
      message =
        'Impressive! You are ready for more complex structures and new words.';
    }

    return {
      recommendation,
      message,
      targetFluency: Math.min(100, fluencyScore + 5),
    };
  }
}
