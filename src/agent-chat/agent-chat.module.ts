import { Module } from '@nestjs/common';
import { AgentChatController } from './agent-chat.controller';
import { AgentChatService } from './agent-chat.service';
import { OpenRouterModule } from 'src/open-router/open-router.module';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { PinecodeModule } from 'src/pinecode/pinecode.module';

@Module({
  controllers: [AgentChatController],
  providers: [AgentChatService],
  imports: [OpenRouterModule, SupabaseModule, PinecodeModule],
})
export class AgentChatModule {}
