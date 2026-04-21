import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActionsModule } from './modules/actions/actions.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { RedisModule } from './modules/redis/redis.module';
import { EventsModule } from './modules/events/events.module';
import { SharedModule } from './modules/shared/shared.module';
import { LinguisticsModule } from './modules/linguistics/linguistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    RedisModule,
    EventsModule,
    SharedModule,
    LinguisticsModule,
    ActionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
