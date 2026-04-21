import { Module } from '@nestjs/common';
import { LinguisticRefinerService } from './linguistic-refiner.service';
import { LinguisticsController } from './linguistics.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [LinguisticsController],
  providers: [LinguisticRefinerService],
  exports: [LinguisticRefinerService],
})
export class LinguisticsModule {}
