import { Module } from '@nestjs/common';
import { SynapseController } from './synapse.controller';
import { SynapseService } from './synapse.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { GeminiProvider, GemmaProvider, GroqProvider } from './llm.provider';

@Module({
  imports: [SupabaseModule],
  controllers: [SynapseController],
  providers: [SynapseService, GeminiProvider, GemmaProvider, GroqProvider],
  exports: [SynapseService],
})
export class SynapseModule {}
