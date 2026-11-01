import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { PushScheduler } from './push.scheduler';
import { PushService } from './push.service';

@Module({
  imports: [SupabaseModule],
  providers: [PushService, PushScheduler],
})
export class PushModule {}
