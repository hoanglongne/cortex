import { Injectable, Logger } from '@nestjs/common';
import nlp from 'compromise';
import { WordTokenizer } from 'natural';
import { SupabaseService } from '../supabase/supabase.service';

export interface BridgeResult {
  activeCount: number;
  passiveCount: number;
  activationRate: number;
  passiveVocabSamples: string[];
  activeVocabSamples: string[];
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

    // Improved Topic Extraction:
    // 1. Get topics identified by compromise
    // 2. Filter out short words and weird characters
    // 3. Add most frequent nouns if no topics found
    let topics = (doc.topics().out('array') as string[]) || [];

    // Filter out common filler topics or weird names like "monty" if they aren't frequent
    const stopTopics = ['monty', 'i', 'you', 'it', 'yeah'];
    topics = topics.filter((t) => !stopTopics.includes(t.toLowerCase().trim()));

    if (topics.length === 0 && nouns.length > 0) {
      // Fallback: use frequent nouns as topics, filtering out pronouns
      const nounCounts: Record<string, number> = {};
      const pronouns = [
        'i',
        'me',
        'my',
        'you',
        'your',
        'he',
        'she',
        'it',
        'we',
        'they',
      ];

      nouns.forEach((n) => {
        const word = n.toLowerCase().trim().replace(/[#@]/g, '');
        if (word.length > 3 && !pronouns.includes(word)) {
          nounCounts[word] = (nounCounts[word] || 0) + 1;
        }
      });
      topics = Object.entries(nounCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([word]) => word);
    }

    // Final cleanup of topics
    topics = topics
      .map((t) => t.replace(/[#@]/g, '').trim())
      .filter((t) => t.length > 2 && !/^\d+$/.test(t));

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
      topics: Array.from(new Set(topics)),
      topNouns: nouns.slice(0, 10),
      topVerbs: verbs.slice(0, 10),
    };
  }

  /**
   * Simple fluency analyzer based on text (filler word detection)
   */
  analyzeFluency(text: string, providedFillerCount?: number) {
    const fillers = ['um', 'uh', 'ah', 'well', 'like', 'actually', 'basically'];
    const words = this.tokenizer.tokenize(text.toLowerCase()) || [];

    const textFillerCount = words.filter((w) => fillers.includes(w)).length;
    // Use the maximum of detected fillers from text or provided by the app
    const fillerCount = Math.max(textFillerCount, providedFillerCount || 0);
    const fillerRatio = words.length > 0 ? fillerCount / words.length : 0;

    return {
      fillerCount,
      fillerRatio,
      score: Math.max(0, 100 - fillerRatio * 500), // Crude score
    };
  }

  /**
   * Maps a Lexica ID (v001) to its actual English word
   */
  mapIdToWord(idOrWord: string): string {
    const clean = idOrWord.toLowerCase().trim();
    if (/^v\d{3}$/.test(clean) && clean in this.idToWordMap) {
      return this.idToWordMap[clean];
    }
    return idOrWord;
  }

  private idToWordMap: Record<string, string> = {
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
    v061: 'ANXIOUS',
    v062: 'BLUNT',
    v063: 'CAUTIOUS',
    v064: 'DEMAND',
    v065: 'EFFICIENT',
    v066: 'FLEXIBLE',
    v067: 'GENUINE',
    v068: 'HESITATE',
    v069: 'IMPACT',
    v070: 'JUSTIFY',
    v071: 'KEEN',
    v072: 'LOGICAL',
    v073: 'MASSIVE',
    v074: 'NEGLECT',
    v075: 'OBVIOUS',
    v076: 'PERSISTENT',
    v077: 'RELEVANT',
    v078: 'SIGNIFICANT',
    v079: 'TOLERATE',
    v080: 'UTILIZE',
    v081: 'VALID',
    v082: 'WILLING',
    v083: 'ABSTRACT',
    v084: 'BENEFIT',
    v085: 'CONFIDENT',
    v086: 'DIVERSE',
    v087: 'EVIDENT',
    v088: 'FOCUS',
    v089: 'GENERATE',
    v090: 'HIGHLIGHT',
    v091: 'ADVOCATING',
    v092: 'AMBIVALENT',
    v093: 'ANALOGOUS',
    v094: 'ARTICULATE',
    v095: 'ASSERTIVE',
    v096: 'BIASED',
    v097: 'BUREAUCRATIC',
    v098: 'CATALYST',
    v099: 'CHRONIC',
    v100: 'COMPREHENSIVE',
    v101: 'CONTENTIOUS',
    v102: 'COUNTERPRODUCTIVE',
    v103: 'CREDIBLE',
    v104: 'CUMULATIVE',
    v105: 'CYNICAL',
    v106: 'DECISIVE',
    v107: 'DETRIMENTAL',
    v108: 'DYNAMIC',
    v109: 'ELABORATE',
    v110: 'EMPIRICAL',
    v111: 'EXPLICIT',
    v112: 'FORMIDABLE',
    v113: 'FRAGMENTED',
    v114: 'FUNDAMENTAL',
    v115: 'HYPOTHETICAL',
    v116: 'IMPLICIT',
    v117: 'INDISPENSABLE',
    v118: 'INTEGRATE',
    v119: 'INTUITIVE',
    v120: 'LEVERAGE',
    v121: 'MODICUM',
    v122: 'MOMENTUM',
    v123: 'MONOTONOUS',
    v124: 'NAVIGATE',
    v125: 'OBJECTIVE',
    v126: 'OVERWHELMING',
    v127: 'PARADOX',
    v128: 'PERCEIVE',
    v129: 'PERPETUAL',
    v130: 'PREVALENT',
    v131: 'PROACTIVE',
    v132: 'PROFOUND',
    v133: 'RATIONAL',
    v134: 'SKEPTICAL',
    v135: 'SPONTANEOUS',
    v136: 'SUBJECTIVE',
    v137: 'SUSTAINABLE',
    v138: 'TRANSPARENT',
    v139: 'TRIVIAL',
    v140: 'UNPRECEDENTED',
    v141: 'VULNERABLE',
    v142: 'WARRANTED',
    v143: 'ACRIMONIOUS',
    v144: 'ADMONISH',
    v145: 'AFFLUENT',
    v146: 'ALLEVIATE',
    v147: 'ALTRUISTIC',
    v148: 'ABERRANT',
    v149: 'ANACHRONISTIC',
    v150: 'ANECDOTAL',
    v151: 'ANOMALY',
    v152: 'ANTIQUATED',
    v153: 'APPREHENSIVE',
    v154: 'ARDUOUS',
    v155: 'AUSTERE',
    v156: 'BANAL',
    v157: 'BENEVOLENT',
    v158: 'CALLOUS',
    v159: 'CAPITULATE',
    v160: 'CIRCUMVENT',
    v161: 'CLANDESTINE',
    v162: 'COERCE',
    v163: 'COMPLACENT',
    v164: 'CONCEDE',
    v165: 'CONDESCENDING',
    v166: 'CONVOLUTED',
    v167: 'CREDULOUS',
    v168: 'CURTAIL',
    v169: 'CYNICISM',
    v170: 'DEBILITATING',
    v171: 'DELINEATE',
    v172: 'DISCREPANCY',
    v173: 'DISMISSIVE',
    v174: 'DISPARATE',
    v175: 'DRACONIAN',
    v176: 'DUPLICITOUS',
    v177: 'ELUSIVE',
    v178: 'EMULATE',
    v179: 'EQUIVOCATE',
    v180: 'EXORBITANT',
    v181: 'EXPEDIENT',
    v182: 'EXTRANEOUS',
    v183: 'FALLACIOUS',
    v184: 'FASTIDIOUS',
    v185: 'FERVENT',
    v186: 'FLAGRANT',
    v187: 'FLEETING',
    v188: 'FORTHRIGHT',
    v189: 'FRUGAL',
    v190: 'FUTILE',
    v191: 'GRATUITOUS',
    v192: 'HEGEMONY',
    v193: 'HUBRIS',
    v194: 'HYPOCRITICAL',
    v195: 'IDEALISTIC',
    v196: 'INADVERTENT',
    v197: 'INCONGRUENT',
    v198: 'INDOLENT',
    v199: 'INEXORABLE',
    v200: 'INSIDIOUS',
    v201: 'INTRANSIGENT',
    v202: 'IRREVOCABLE',
    v203: 'LAMENTABLE',
    v204: 'LETHARGIC',
    v205: 'LUCID',
    v206: 'MAGNANIMOUS',
    v207: 'MALLEABLE',
    v208: 'MENDACIOUS',
    v209: 'MELANCHOLY',
    v210: 'MOLLIFY',
    v211: 'MERCURIAL',
    v212: 'NEFARIOUS',
    v213: 'NONCHALANT',
    v214: 'NOSTALGIC',
    v215: 'OBLIVIOUS',
    v216: 'OMINOUS',
    v217: 'OPAQUE',
    v218: 'OSTENTATIOUS',
    v219: 'PEDANTIC',
    v220: 'PERFIDIOUS',
    v221: 'PERTINENT',
    v222: 'PHLEGMATIC',
    v223: 'PLACID',
    v224: 'POLARIZING',
    v225: 'POMPOUS',
    v226: 'PUNCTILIOUS',
    v227: 'PRECARIOUS',
    v228: 'PRESUMPTUOUS',
    v229: 'PRETENTIOUS',
    v230: 'PUGNACIOUS',
    v231: 'ABNEGATION',
    v232: 'ABSTEMIOUS',
    v233: 'ACERBIC',
    v234: 'ACUMEN',
    v235: 'ADUMBRATE',
    v236: 'ANACHRONISM',
    v237: 'ANATHEMA',
    v238: 'APOCRYPHAL',
    v239: 'APOTHEOSIS',
    v240: 'APPROBATION',
    v241: 'ARCANE',
    v242: 'ARRANT',
    v243: 'ARTIFICE',
    v244: 'ASCETIC',
    v245: 'ASSIDUOUS',
    v246: 'ATAVISTIC',
    v247: 'ATTENUATE',
    v248: 'AUGUST',
    v249: 'AVARICE',
    v250: 'BELLICOSE',
    v251: 'BYZANTINE',
    v252: 'CAPRICIOUS',
    v253: 'CASTIGATE',
    v254: 'CAUSTIC',
    v255: 'CHICANERY',
    v256: 'CHURLISH',
    v257: 'CIRCUMLOCUTION',
    v258: 'CLAIRVOYANT',
    v259: 'CLOYING',
    v260: 'COGENT',
    v261: 'COMPUNCTION',
    v262: 'CONFLAGRATION',
    v263: 'CONSTERNATION',
    v264: 'CRAVEN',
    v265: 'CONTRITE',
    v266: 'CONVIVIAL',
    v267: 'COPIOUS',
    v268: 'CUPIDITY',
    v269: 'DEARTH',
    v270: 'DEFERENCE',
    v271: 'DELETERIOUS',
    v272: 'DENOUEMENT',
    v273: 'DESULTORY',
    v274: 'INVETERATE',
    v275: 'LACHRYMOSE',
    v276: 'LAMBASTE',
    v277: 'LANGUID',
    v278: 'LOQUACIOUS',
    v279: 'MACHIAVELLIAN',
    v280: 'MAGNILOQUENT',
    v281: 'MALADROIT',
    v282: 'MALAISE',
    v283: 'MERETRICIOUS',
    v284: 'METTLESOME',
    v285: 'MISANTHROPIC',
    v286: 'MNEMONIC',
    v287: 'MORDANT',
    v288: 'MUNIFICENT',
    v289: 'NEBULOUS',
    v290: 'NOISOME',
    v291: 'OBDURATE',
    v292: 'OBSTREPEROUS',
    v293: 'OBTUSE',
    v294: 'OFFICIOUS',
    v295: 'OLEAGINOUS',
    v296: 'ONEROUS',
    v297: 'OPPROBRIUM',
    v298: 'PARSIMONIOUS',
    v299: 'PEJORATIVE',
    v300: 'PENURIOUS',
    v301: 'PERSPECTIVE',
    v302: 'AMBITIOUS',
    v303: 'COLLABORATE',
    v304: 'ADAPTABLE',
    v305: 'REDUCE',
    v306: 'POTENTIAL',
    v307: 'SPECIFIC',
    v308: 'CONSISTENT',
    v309: 'VALUABLE',
    v310: 'PRECISE',
    v311: 'ALTERNATIVE',
    v312: 'COMPLICATED',
    v313: 'ESSENTIAL',
    v314: 'OBJECT',
    v315: 'CONTRIBUTE',
    v316: 'INITIAL',
    v317: 'OBTAIN',
    v318: 'ESTIMATE',
    v319: 'TYPICAL',
    v320: 'VERSATILE',
    v321: 'SUFFICIENT',
    v322: 'PRIORITY',
    v323: 'APPROACH',
    v324: 'DETERMINED',
    v325: 'ACCURATE',
    v326: 'CONVINCE',
    v327: 'PROCEDURE',
    v328: 'SIGNIFICANCE',
    v329: 'REVEAL',
    v330: 'CHALLENGING',
    v331: 'ACQUIRE',
    v332: 'BENEFICIAL',
    v333: 'CAPABLE',
    v334: 'CONTRADICT',
    v335: 'DISTINCT',
    v336: 'ELIMINATE',
    v337: 'FLEXIBILITY',
    v338: 'GENERALIZE',
    v339: 'HINDER',
    v340: 'IMPLEMENT',
    v341: 'INADEQUATE',
    v342: 'LACK',
    v343: 'MAINTAIN',
    v344: 'NOTABLE',
    v345: 'OPTIMISTIC',
    v346: 'PARTIAL',
    v347: 'PRACTICAL',
    v348: 'QUICKLY',
    v349: 'REACTION',
    v350: 'SKEPTICISM',
    v351: 'TENDENCY',
    v352: 'UNEXPECTED',
    v353: 'VALIDATE',
    v354: 'WORTHWHILE',
    v355: 'YIELD',
    v356: 'ABANDON',
    v357: 'BRIEF',
    v358: 'CERTAIN',
    v359: 'CONVINCE',
    v360: 'DECLINE',
    v361: 'ACCOMMODATE',
    v362: 'BENEFIT',
    v363: 'CHALLENGE',
    v364: 'DELIBERATE',
    v365: 'ESSENTIAL',
    v366: 'FINANCIAL',
    v367: 'GENEROUS',
    v368: 'HESITATE',
    v369: 'IMMEDIATE',
    v370: 'JUSTIFY',
    v371: 'KNOWLEDGEABLE',
    v372: 'LOGICAL',
    v373: 'MOTIVATE',
    v374: 'NEGATIVE',
    v375: 'OBVIOUS',
    v376: 'PERSISTENT',
    v377: 'QUALITY',
    v378: 'REASONABLE',
    v379: 'SPECIFIC',
    v380: 'TRADITIONAL',
    v381: 'ULTIMATE',
    v382: 'VAGUE',
    v383: 'WILLING',
    v384: 'ACCURATE',
    v385: 'BELIEVABLE',
    v386: 'CONVENIENT',
    v387: 'DEPENDABLE',
    v388: 'EFFECTIVE',
    v389: 'FAMILIAR',
    v390: 'GRATEFUL',
    v391: 'HONEST',
    v392: 'IGNORE',
    v393: 'INTENTION',
    v394: 'JEALOUS',
    v395: 'LIMIT',
    v396: 'MANAGE',
    v397: 'NECESSARY',
    v398: 'OPTIMUM',
    v399: 'PATIENT',
    v400: 'QUARREL',
    v401: 'REACTION',
    v402: 'STUBBORN',
    v403: 'TEMPORARY',
    v404: 'URGENT',
    v405: 'VALUABLE',
    v406: 'WONDER',
    v407: 'ADMIT',
    v408: 'BORING',
    v409: 'COMPLAIN',
    v432: 'DELIGHTED',
  };

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
        { user_id: userId },
      )) as Array<{ word: string }>;

      // Ensure we have unique words and all IDs are mapped
      const learnedWordsSet = new Set<string>();
      learnedWordsData.forEach((v) => {
        const mapped = this.mapIdToWord(v.word);
        if (mapped) {
          learnedWordsSet.add(mapped.toLowerCase().trim());
        }
      });

      const learnedWords = Array.from(learnedWordsSet);

      this.logger.log(
        `Found ${learnedWords.length} unique learned words for user ${userId}`,
      );

      if (learnedWords.length === 0) {
        return {
          activeCount: 0,
          passiveCount: 0,
          activationRate: 0,
          passiveVocabSamples: [],
          activeVocabSamples: [],
          message: 'No learned vocabulary found in Lexica',
        };
      }

      // 2. Identify which learned words have been used
      // Normalize usedWords for comparison
      const normalizedUsedWords = new Set(
        usedWords.map((w) => w.toLowerCase().trim()),
      );

      const activeVocab = learnedWords.filter((word) =>
        normalizedUsedWords.has(word),
      );
      const passiveVocab = learnedWords.filter(
        (word) => !normalizedUsedWords.has(word),
      );

      // 3. Return the data to the controller
      return {
        activeCount: activeVocab.length,
        passiveCount: passiveVocab.length,
        activationRate:
          learnedWords.length > 0
            ? (activeVocab.length / learnedWords.length) * 100
            : 0,
        passiveVocabSamples: passiveVocab.slice(0, 50), // Limit to 50 samples for stability
        activeVocabSamples: activeVocab.slice(0, 50),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Vocab bridge failed: ${message}`);
      return {
        activeCount: 0,
        passiveCount: 0,
        activationRate: 0,
        passiveVocabSamples: [],
        activeVocabSamples: [],
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
