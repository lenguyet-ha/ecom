import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/shared/services/s3.service';
import { unlink } from 'fs/promises';
import { generateRandomFilename } from 'src/shared/helpers';
@Injectable()
export class MediaService {
    constructor(private readonly s3Service: S3Service) {}

    async uploadFile(files: Array<Express.Multer.File>) {
        const result = await Promise.all(
            files.map((file) => {
                return this.s3Service
                    .uploadedFile({
                        filename: 'images/' + file.filename,
                        filepath: file.path,
                        contentType: file.mimetype,
                    })
                    .then((res) => {
                        return { url: res.Location };
                    });
            }),
        );
        // Xóa file sau khi upload lên S3
        await Promise.all(
            files.map((file) => {
                return unlink(file.path);
            }),
        );
        return result;
    }

    async getPresignUrl(body: { filename: string }) {
        const randomFilename = generateRandomFilename(body.filename);
        const presignedUrl = await this.s3Service.createPresignedUrlWithClient(randomFilename);
        const url = presignedUrl.split('?')[0];
        return {
            presignedUrl,
            url,
        };
    }
}
