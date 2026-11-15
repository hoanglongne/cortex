import { Module } from '@nestjs/common';
import { StudioLlm } from '../studio/studio-llm';
import { LexicaController } from './lexica.controller';
import { LexicaService } from './lexica.service';
import {
  DialAccountController,
  DialExtensionController,
} from './dial.controller';
import { DialService } from './dial.service';

@Module({
  controllers: [
    LexicaController,
    DialAccountController,
    DialExtensionController,
  ],
  providers: [LexicaService, StudioLlm, DialService],
})
export class LexicaModule {}
