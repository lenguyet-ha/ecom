import {
    BadRequestException,
    Body,
    Controller,
    FileTypeValidator,
    Get,
    MaxFileSizeValidator,
    NotFoundException,
    Param,
    ParseFilePipe,
    Post,
    Res,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import path from 'path';
import envConfig from 'src/shared/config';
import { UPLOAD_DIR } from 'src/shared/constants/other.constant';
import { IsPublic } from 'src/shared/decorators/public.decorator';
import { MediaService } from './media.service';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { AuthType } from 'src/shared/constants/auth.constant';
import { ParseFilePipeWithUnlink } from './parse-file-pipe-with-unlink.pipe';

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}
    @Auth([AuthType.Bearer])
    @Post('images/upload')
    @UseInterceptors(
        FilesInterceptor('files', 100, {
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
        }),
    )
    uploadFile(
        @UploadedFiles(
            new ParseFilePipeWithUnlink({
                validators: [new MaxFileSizeValidator({ maxSize: 1 * 1024 * 1024 })],
            }),
        )
        files: Array<Express.Multer.File>,
    ) {
        const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
        files.forEach((file, index) => {
            if (!allowedTypes.includes(file.mimetype)) {
                throw new BadRequestException(
                    `File ${file.originalname} has invalid type: ${file.mimetype}. Expected types: ${allowedTypes.join(', ')}`,
                );
            }
        });
        return this.mediaService.uploadFile(files);
    }

    @Get('static/:filename')
    @IsPublic()
    serveFile(@Param('filename') filename: string, @Res() res: Response) {
        return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
            if (error) {
                const notfound = new NotFoundException('File not found');
                res.status(notfound.getStatus()).json(notfound.getResponse());
            }
        });
    }

    @Post('images/upload/presigned-url')
    @IsPublic()
    async createPresignedUrl(@Body() body: { filename: string }) {
        return this.mediaService.getPresignUrl(body);
    }
}
