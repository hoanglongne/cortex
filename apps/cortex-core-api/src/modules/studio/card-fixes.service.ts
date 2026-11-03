import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { checkRewrite, retiredIds } from './card-fixes';
import { StudioService } from './studio.service';

type Db = SupabaseClient<any, any, any>;

export interface CardFixState {
  hidden: Set<string>;
  /** card id → the new sentence waiting in (or already in) the overlay */
  rewritten: Map<string, string>;
}

interface Found {
  word: string;
  scenario: string;
  kind: 'core' | 'studio';
}

/** Hide a card for now, or give it a new example sentence (issue #62). */
@Injectable()
export class CardFixesService {
  constructor(private readonly studio: StudioService) {}

  /** What is already hidden or rewritten, for the cards on screen. Empty when the SQL is not run yet. */
  async stateFor(db: Db, ids: readonly string[]): Promise<CardFixState> {
    if (ids.length === 0) return { hidden: new Set(), rewritten: new Map() };
    const [hidden, rewrites] = await Promise.all([
      db.from('studio_hidden_cards').select('card_id').in('card_id', ids),
      db
        .from('studio_card_rewrites')
        .select('card_id, scenario')
        .in('card_id', ids),
    ]);
    return {
      hidden: new Set(
        ((hidden.data ?? []) as { card_id: string }[]).map((r) => r.card_id),
      ),
      rewritten: new Map(
        ((rewrites.data ?? []) as { card_id: string; scenario: string }[]).map(
          (r) => [r.card_id, r.scenario],
        ),
      ),
    };
  }

  private async find(db: Db, id: string): Promise<Found> {
    const core = await db
      .from('studio_core_cards')
      .select('word, scenario')
      .eq('id', id)
      .maybeSingle();
    if (core.data)
      return {
        ...(core.data as { word: string; scenario: string }),
        kind: 'core',
      };
    const own = await db
      .from('studio_cards')
      .select('word, scenario')
      .eq('id', id)
      .maybeSingle();
    if (own.data)
      return {
        ...(own.data as { word: string; scenario: string }),
        kind: 'studio',
      };
    throw new NotFoundException('Không tìm thấy thẻ');
  }

  /** Writes the manifest again with the current retired list so the change reaches Lexica now. */
  private async syncManifest(db: Db, userId: string | null) {
    const live = await this.studio.readManifest(db);
    // Nothing published yet: the first publish picks the hidden cards up.
    if (!live) return;
    const [retired, hidden] = await Promise.all([
      db.from('studio_cards').select('id').eq('lifecycle', 'retired'),
      db.from('studio_hidden_cards').select('card_id'),
    ]);
    const list = retiredIds(
      ((retired.data ?? []) as { id: string }[]).map((r) => r.id),
      ((hidden.data ?? []) as { card_id: string }[]).map((r) => r.card_id),
    );
    await this.studio.writeManifest(
      db,
      userId,
      { ...live, updatedAt: new Date().toISOString(), retired: list },
      { retired: list.length },
      'hide_cards',
    );
  }

  async hide(db: Db, userId: string, id: string, reason?: string) {
    await this.find(db, id);
    const res = await db.from('studio_hidden_cards').upsert({
      card_id: id,
      reason: reason?.slice(0, 200) ?? null,
      hidden_by: userId,
    });
    if (res.error) throw new BadRequestException(res.error.message);
    await this.syncManifest(db, userId);
    return { id, hidden: true };
  }

  async unhide(db: Db, userId: string, id: string) {
    const res = await db.from('studio_hidden_cards').delete().eq('card_id', id);
    if (res.error) throw new BadRequestException(res.error.message);
    await this.syncManifest(db, userId);
    return { id, hidden: false };
  }

  /**
   * A card of a Studio drop is edited in place (it ships with the next drop
   * publish). A card of the Lexica app is rewritten through the overlay, which
   * goes out with "Xuất bản".
   */
  async rewrite(db: Db, userId: string, id: string, scenario: string) {
    const card = await this.find(db, id);
    const problem = checkRewrite(card.word, scenario);
    if (problem) throw new BadRequestException(problem);
    const text = scenario.trim();
    if (card.kind === 'studio') {
      await this.studio.updateCard(db, id, { scenario: text });
      return { id, via: 'drop' as const };
    }
    const res = await db.from('studio_card_rewrites').upsert({
      card_id: id,
      scenario: text,
      editor_id: userId,
      updated_at: new Date().toISOString(),
    });
    if (res.error) throw new BadRequestException(res.error.message);
    return { id, via: 'overlay' as const };
  }

  async unrewrite(db: Db, id: string) {
    const res = await db
      .from('studio_card_rewrites')
      .delete()
      .eq('card_id', id);
    if (res.error) throw new BadRequestException(res.error.message);
    return { id };
  }
}
