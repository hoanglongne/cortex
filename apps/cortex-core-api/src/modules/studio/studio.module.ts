import { Module } from '@nestjs/common';
import { CaptureController } from './capture.controller';
import { CaptureService } from './capture.service';
import { ContentController } from './content.controller';
import { PipelineService } from './pipeline.service';
import { StudioScheduler } from './scheduler';
import { EditorGuard } from './editor.guard';
import { StudioController } from './studio.controller';
import { StudioLlm } from './studio-llm';
import { StudioService } from './studio.service';
import { VariantsService } from './variants.service';
import { QuotesService } from './quotes.service';

@Module({
  controllers: [StudioController, ContentController, CaptureController],
  providers: [
    StudioService,
    StudioLlm,
    EditorGuard,
    PipelineService,
    StudioScheduler,
    CaptureService,
    VariantsService,
    QuotesService,
  ],
})
export class StudioModule {}
