import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { CardStatsScheduler } from './card-stats.scheduler';

@Module({ imports: [SupabaseModule], providers: [CardStatsScheduler] })
export class StatsModule {}
