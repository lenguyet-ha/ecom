import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import multer from 'multer';
import path from 'path';
import { MediaController } from 'src/routes/media/media.controller';
import { generateRandomFilename } from 'src/shared/helpers';
import { MediaService } from './media.service';
const UPLOAD_DIR = path.resolve('upload');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const newFilename = generateRandomFilename(file.originalname);
        cb(null, newFilename);
    },
});

@Module({
    providers: [MediaService],
    imports: [
        MulterModule.register({
            storage,
        }),
    ],
    controllers: [MediaController],
})
export class MediaModule {
    constructor() {
        if (!existsSync(UPLOAD_DIR)) {
            mkdirSync(UPLOAD_DIR, { recursive: true });
        }
    }
}
