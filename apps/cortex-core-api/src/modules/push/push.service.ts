import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import webpush from 'web-push';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PushPayload } from './push-rules';

/** Sends a web push to every device a person has agreed on, and forgets dead ones. */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private ready = false;

  constructor(private readonly config: ConfigService) {
    const pub =
      this.config.get<string>('NEXT_PUBLIC_VAPID_PUBLIC_KEY') ??
      this.config.get<string>('VAPID_PUBLIC_KEY');
    const priv = this.config.get<string>('VAPID_PRIVATE_KEY');
    if (pub && priv) {
      webpush.setVapidDetails(
        this.config.get<string>('VAPID_SUBJECT') || 'mailto:hello@cortex.app',
        pub,
        priv,
      );
      this.ready = true;
    }
  }

  enabled(): boolean {
    return this.ready;
  }

  /** Returns how many devices received it. */
  async sendTo(
    db: SupabaseClient<any, any, any>,
    userId: string,
    payload: PushPayload,
  ): Promise<number> {
    if (!this.ready) return 0;
    const { data } = await db
      .from('lexica_push_subscriptions')
      .select('id, endpoint, p256dh, auth, fail_count')
      .eq('user_id', userId);
    let sent = 0;
    for (const s of (data ?? []) as {
      id: string;
      endpoint: string;
      p256dh: string;
      auth: string;
      fail_count: number;
    }[]) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
          { TTL: 3600 },
        );
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // Gone for good (uninstalled, permission removed): forget it; anything else: count, drop after 5
        if (status === 404 || status === 410 || s.fail_count >= 4)
          await db.from('lexica_push_subscriptions').delete().eq('id', s.id);
        else
          await db
            .from('lexica_push_subscriptions')
            .update({ fail_count: s.fail_count + 1 })
            .eq('id', s.id);
        this.logger.debug(`push to ${s.id} failed (${status ?? 'error'})`);
      }
    }
    return sent;
  }
}
