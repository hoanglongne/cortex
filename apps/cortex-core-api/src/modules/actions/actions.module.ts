import { Module } from '@nestjs/common';
import { ActionsController } from './actions.controller';
import { LinguisticsModule } from '../linguistics/linguistics.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [LinguisticsModule, SupabaseModule],
  controllers: [ActionsController],
})
export class ActionsModule {}
