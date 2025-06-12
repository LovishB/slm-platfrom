import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [SupabaseModule]
})
export class UsersModule {}
