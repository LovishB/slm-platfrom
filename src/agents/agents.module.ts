import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  controllers: [AgentsController],
  providers: [AgentsService],
  imports: [SupabaseModule]
})

export class AgentsModule {}
