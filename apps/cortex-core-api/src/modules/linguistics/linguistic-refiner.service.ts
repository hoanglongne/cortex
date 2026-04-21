import { Injectable, Logger } from '@nestjs/common';
import nlp from 'compromise';
import { WordTokenizer } from 'natural';

@Injectable()
export class LinguisticRefinerService {
  private readonly logger = new Logger(LinguisticRefinerService.name);
  private tokenizer = new WordTokenizer();

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
      uniqueWords: new Set(keywords).size,
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
}
