import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { PipelineService } from './pipeline.service';
import { StudioScheduler } from './scheduler';
import { EditorGuard } from './editor.guard';
import { StudioController } from './studio.controller';
import { StudioLlm } from './studio-llm';
import { StudioService } from './studio.service';

@Module({
  controllers: [StudioController, ContentController],
  providers: [
    StudioService,
    StudioLlm,
    EditorGuard,
    PipelineService,
    StudioScheduler,
  ],
})
export class StudioModule {}
