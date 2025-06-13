import { Module } from '@nestjs/common';
import { PinecodeService } from './pinecode.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { PinecodeController } from './pinecode.controller';

@Module({
  providers: [PinecodeService],
  imports: [SupabaseModule],
  controllers: [PinecodeController],
  exports: [PinecodeService]
})
export class PinecodeModule {}
