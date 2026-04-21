import { Module, Global } from '@nestjs/common';
import { RewardHelper } from './reward-helper.service';

@Global()
@Module({
  providers: [RewardHelper],
  exports: [RewardHelper],
})
export class SharedModule {}
