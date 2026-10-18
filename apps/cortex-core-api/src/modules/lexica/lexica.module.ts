import { Module } from '@nestjs/common';
import { StudioLlm } from '../studio/studio-llm';
import { LexicaController } from './lexica.controller';
import { LexicaService } from './lexica.service';

@Module({
  controllers: [LexicaController],
  providers: [LexicaService, StudioLlm],
})
export class LexicaModule {}
