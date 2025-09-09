import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

const sharedServices = [PrismaService];

@Global()
@Module({
    providers: sharedServices,
    exports: sharedServices,
})
export class SharedModule {}
