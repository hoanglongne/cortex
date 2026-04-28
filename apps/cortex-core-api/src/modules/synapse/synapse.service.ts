import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ActionLog, SynapseScenario } from '@cortex/types';
import { WORLD_BIBLES } from './world-bibles';
import { GeminiProvider, GemmaProvider, GroqProvider } from './llm.provider';

@Injectable()
export class SynapseService {
  private readonly logger = new Logger(SynapseService.name);

  constructor(
    private supabaseService: SupabaseService,
    private geminiProvider: GeminiProvider,
    private groqProvider: GroqProvider,
    private gemmaProvider: GemmaProvider,
  ) {}

  async generateScenario(
    sessionId: string,
    stage: number,
    sessionHistory: ActionLog[] = [],
    loreId: string = 'cyberpunk-01',
    missionId?: string,
  ): Promise<SynapseScenario> {
    this.logger.log(
      `Generating scenario for session ${sessionId}, stage ${stage} with lore ${loreId}, mission ${missionId}`,
    );

    const lore = WORLD_BIBLES[loreId] || WORLD_BIBLES['cyberpunk-01'];
    const mission =
      lore.missions.find((m) => m.id === missionId) || lore.missions[0];

    let historyContext = '';
    if (sessionHistory && sessionHistory.length > 0) {
      // Only take the last 2 stages to save tokens while maintaining continuity
      const recentHistory = sessionHistory
        .filter((log) => log.actionType === 'CHOOSE_PARTICLE')
        .slice(-2);

      const pastChoices = recentHistory
        .map((log) => {
          const meta = log.metadata || {};
          return `S${meta.stage}: ${meta.baseVerb}+${meta.particle} (${meta.isCorrect ? 'OK' : 'FAIL'}) -> ${meta.outcome}`;
        })
        .join('\n');

      if (pastChoices) {
        historyContext = `\n# RECENT HISTORY (Maintain continuity):\n${pastChoices}\n=> Continue from the last outcome. Keep entities consistent.`;
      }
    }

    const prompt = `
# ROLE: Synapse Architect (Cyberpunk survival scenarios for Phrasal Verbs).
# WORLD: ${lore.name}. Context: ${lore.context.substring(0, 200)}...
# MISSION: ${mission.name}. Briefing: ${mission.briefing}. Objective: ${mission.objective}
# OBJECTIVE: Create a branching scenario for Stage ${stage}/5. ${historyContext}

# RULES:
1. Scenario: Intense, 2-3 sentences in Vietnamese, ending at the base verb.
2. Phrasal Verb: Random common verb + 4 particles. Only 1 correct (idiomatic meaning).
3. Incorrect choices: Vividly describe disastrous outcomes in Vietnamese.
4. Language: Story (Vietnamese). Verb/Meaning/Example (English).
5. Effects: Correct choices may have 'restore_life' or 'integrity_boost'.

# JSON OUTPUT:
{
  "missionCode": "SN-${stage}-${Math.floor(Math.random() * 1000)}",
  "baseVerb": "string",
  "narrative": "string",
  "choices": [{"particle": "string", "meaning": "string", "outcome": "string", "isCorrect": boolean, "effect": "string"}],
  "technicalHint": "string",
  "isFinalBoss": ${stage === 5}
}
# CONSTRAINT: JSON ONLY. NO PROSE.
`;

    // Strategy: Gemini -> Groq (Llama 3.3) -> Gemma (Local) -> Fallback
    try {
      this.logger.log('Attempting Gemini...');
      return await this.geminiProvider.generateScenario(prompt);
    } catch (geminiErr: unknown) {
      const geminiMsg =
        geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
      this.logger.warn(`Gemini failed: ${geminiMsg}. Trying Groq...`);
      try {
        return await this.groqProvider.generateScenario(prompt);
      } catch (groqErr: unknown) {
        const groqMsg =
          groqErr instanceof Error ? groqErr.message : String(groqErr);
        this.logger.warn(`Groq failed: ${groqMsg}. Trying Local Gemma...`);
        try {
          return await this.gemmaProvider.generateScenario(prompt);
        } catch (localErr: unknown) {
          const localMsg =
            localErr instanceof Error ? localErr.message : String(localErr);
          this.logger.warn(`Local Gemma failed: ${localMsg}`);
          this.logger.error(`All AI Providers failed.`);
          return this.getHardcodedFallback(stage);
        }
      }
    }
  }

  private getHardcodedFallback(stage: number): SynapseScenario {
    const fallbacks: SynapseScenario[] = [
      {
        missionCode: `FALLBACK-${stage}`,
        baseVerb: 'break',
        narrative:
          'Hệ thống liên lạc với AI trung tâm đã sập. Cảnh cửa duy nhất trước mặt bạn đang bị kẹt cứng, xung quanh là tiếng còi báo động chói tai. Bạn phải...',
        choices: [
          {
            particle: 'down',
            meaning: 'to smash or demolish something',
            outcome:
              'Bạn phá tung cánh cửa, tạo tiếng động lớn đánh thức bầy drone bảo vệ. Chúng tràn vào và tiêu diệt bạn ngay lập tức.',
            isCorrect: false,
          },
          {
            particle: 'in',
            meaning: 'to enter a building by force',
            outcome:
              'Bạn cố gắng đột nhập vào hệ thống mạng nội bộ. Mật khẩu được bẻ khóa thành công, cửa tự động mở ra.',
            isCorrect: true,
          },
          {
            particle: 'out',
            meaning: 'to escape from a place',
            outcome:
              'Bạn cố gắng phá cửa thoát ra ngoài nhưng lại kích hoạt hệ thống tự hủy. Căn phòng nổ tung.',
            isCorrect: false,
          },
          {
            particle: 'up',
            meaning: 'to separate into pieces',
            outcome:
              'Bạn đập vỡ bảng điều khiển, khiến toàn bộ hệ thống điện bị đoản mạch. Cửa bị khóa vĩnh viễn.',
            isCorrect: false,
          },
        ],
        technicalHint: 'System Override - Connection Lost',
      },
      {
        missionCode: `FALLBACK-${stage}`,
        baseVerb: 'run',
        narrative:
          'Sau khi qua được cửa, bạn phát hiện cốt lõi dữ liệu (data core) của Megacorp đang bị rò rỉ chất làm mát cực độc. Khí gas màu xanh lục tràn ngập không gian. Bạn phải...',
        choices: [
          {
            particle: 'away',
            meaning: 'to leave or escape from a place',
            outcome:
              'Bạn bỏ chạy, nhưng khí độc lan quá nhanh. Mắt bạn mờ đi trước khi kịp tìm thấy lối thoát.',
            isCorrect: false,
          },
          {
            particle: 'into',
            meaning: 'to meet someone by chance',
            outcome:
              'Bạn chạy thẳng vào làn khí và tình cờ va phải một bộ đồ bảo hộ (hazmat suit) treo trên tường. Bạn sống sót.',
            isCorrect: true,
          },
          {
            particle: 'out of',
            meaning: 'to have nothing left',
            outcome:
              'Bạn cạn kiệt oxy trong bình thở phụ. Hệ thống hô hấp sụp đổ.',
            isCorrect: false,
          },
          {
            particle: 'over',
            meaning: 'to hit with a vehicle',
            outcome:
              'Bạn trượt chân ngã xuống băng chuyền và bị cỗ máy nghiền nát.',
            isCorrect: false,
          },
        ],
        technicalHint: 'Hazardous Environment',
      },
      {
        missionCode: `FALLBACK-${stage}`,
        baseVerb: 'look',
        narrative:
          'Bạn tìm thấy thiết bị lưu trữ, nhưng nó được bảo vệ bởi hàng ngàn dòng code độc mã hóa liên tục thay đổi. Để lấy được mật mã gốc, bạn phải...',
        choices: [
          {
            particle: 'after',
            meaning: 'to take care of someone/something',
            outcome:
              'Bạn cố gắng bảo vệ ổ cứng nhưng bị firewall đốt cháy bảng mạch của thiết bị.',
            isCorrect: false,
          },
          {
            particle: 'for',
            meaning: 'to search for something',
            outcome:
              'Bạn mải mê tìm kiếm lỗ hổng thủ công, tốn quá nhiều thời gian và bị AI phát hiện.',
            isCorrect: false,
          },
          {
            particle: 'into',
            meaning: 'to investigate or examine',
            outcome:
              'Bạn điều tra sâu vào cấu trúc vòng lặp của mã độc, tìm thấy một cửa hậu (backdoor) và trích xuất thành công dữ liệu.',
            isCorrect: true,
          },
          {
            particle: 'up',
            meaning: 'to search for information in a book/database',
            outcome:
              'Bạn tra cứu từ điển mã độc trên mạng nội bộ, kích hoạt chuông báo động cấp cao nhất.',
            isCorrect: false,
          },
        ],
        technicalHint: 'Digital Infiltration',
      },
    ];

    const fallbackIndex = (stage - 1) % fallbacks.length;
    return fallbacks[fallbackIndex];
  }
}
