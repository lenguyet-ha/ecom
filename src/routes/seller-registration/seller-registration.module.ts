import { Module } from '@nestjs/common';
import { SellerRegistrationService } from './seller-registration.service';
import { SellerRegistrationRepository } from './seller-registration.repository';
import { PrismaClient } from '@prisma/client';
import { SellerRegistrationController } from './seller-registration.controller';

@Module({
  controllers: [SellerRegistrationController],
  providers: [
    SellerRegistrationService,
    SellerRegistrationRepository,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  exports: [SellerRegistrationService],
})
export class SellerRegistrationModule {}
