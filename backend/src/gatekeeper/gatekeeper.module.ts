import { Module } from '@nestjs/common';
import { GatekeeperService } from './gatekeeper.service';

@Module({
  providers: [GatekeeperService],
  exports: [GatekeeperService],
})
export class GatekeeperModule {}
