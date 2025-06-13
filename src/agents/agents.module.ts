import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { PinecodeModule } from 'src/pinecode/pinecode.module';

@Module({
  controllers: [AgentsController],
  providers: [AgentsService],
  imports: [SupabaseModule, PinecodeModule]
})

export class AgentsModule {}
