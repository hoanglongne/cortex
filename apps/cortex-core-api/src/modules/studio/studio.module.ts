import { Module } from '@nestjs/common';
import { EditorGuard } from './editor.guard';
import { StudioController } from './studio.controller';
import { StudioLlm } from './studio-llm';
import { StudioService } from './studio.service';

@Module({
  controllers: [StudioController],
  providers: [StudioService, StudioLlm, EditorGuard],
})
export class StudioModule {}
