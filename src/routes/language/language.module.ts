import { Module } from '@nestjs/common';
import { LanguageController } from 'src/routes/language/language.controller';

import { LanguageService } from 'src/routes/language/language.service';

@Module({
    providers: [LanguageService],
    controllers: [LanguageController],
})
export class LanguageModule {}
