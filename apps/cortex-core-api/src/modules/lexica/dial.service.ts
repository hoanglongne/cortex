import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  hashDialToken,
  newDialToken,
  parseDialTaps,
  type DialTap,
} from './dial';

type Res = { data: unknown; error: { message: string } | null };

/**
 * Núm vặn extension, cross-device (issue #141). All data access goes through
 * security-definer functions in supabase/migration_lexica_dial.sql: the
 * learner's own session for token and claim, the token hash for the rest.
 */
@Injectable()
export class DialService {
  constructor(private readonly supabase: SupabaseService) {}

  private asUser(accessToken: string | undefined) {
    const db = accessToken ? this.supabase.clientForToken(accessToken) : null;
    if (!db) throw new ServiceUnavailableException('Supabase chưa cấu hình');
    return db;
  }

  private anon() {
    const db = this.supabase.getClient();
    if (!db) throw new ServiceUnavailableException('Supabase chưa cấu hình');
    return db;
  }

  /** A new token for the signed-in learner; the old one stops working. */
  async issueToken(
    accessToken: string | undefined,
  ): Promise<{ token: string }> {
    const token = newDialToken();
    const res = (await this.asUser(accessToken).rpc('lexica_dial_token_set', {
      p_token_hash: hashDialToken(token),
    })) as Res;
    if (res.error) throw new Error(res.error.message);
    return { token };
  }

  async revokeToken(accessToken: string | undefined): Promise<{ ok: true }> {
    const res = (await this.asUser(accessToken).rpc(
      'lexica_dial_token_revoke',
    )) as Res;
    if (res.error) throw new Error(res.error.message);
    return { ok: true };
  }

  /** Taps waiting from the extension, removed as they are returned. */
  async claimTaps(accessToken: string | undefined): Promise<DialTap[]> {
    const res = (await this.asUser(accessToken).rpc(
      'lexica_dial_claim_taps',
    )) as Res;
    if (res.error) throw new Error(res.error.message);
    const rows = (res.data ?? []) as { card_id: string; tapped_at: string }[];
    return rows.map((r) => ({
      cardId: r.card_id,
      at: Date.parse(r.tapped_at),
    }));
  }

  async schedule(token: string | null): Promise<Record<string, number>> {
    if (!token) throw new UnauthorizedException('Thiếu mã tiện ích');
    const res = (await this.anon().rpc('lexica_dial_schedule', {
      p_token_hash: hashDialToken(token),
    })) as Res;
    if (res.error) throw new Error(res.error.message);
    if (res.data === null || typeof res.data !== 'object') {
      throw new UnauthorizedException('Mã tiện ích sai hoặc đã bị thu hồi');
    }
    return res.data as Record<string, number>;
  }

  async addTaps(
    token: string | null,
    body: unknown,
  ): Promise<{ kept: number }> {
    if (!token) throw new UnauthorizedException('Thiếu mã tiện ích');
    const taps = parseDialTaps(body);
    const res = (await this.anon().rpc('lexica_dial_add_taps', {
      p_token_hash: hashDialToken(token),
      p_taps: taps,
    })) as Res;
    if (res.error) throw new Error(res.error.message);
    if (res.data === -1) {
      throw new UnauthorizedException('Mã tiện ích sai hoặc đã bị thu hồi');
    }
    return { kept: Number(res.data) };
  }
}
