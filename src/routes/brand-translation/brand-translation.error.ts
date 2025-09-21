import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

export const BrandTranslationNotFoundException = new NotFoundException([
    {
        message: 'Error.BrandTranslationNotFound',
        path: 'brandTranslationId',
    },
]);

export const BrandTranslationAlreadyExistsException = new UnprocessableEntityException([
    {
        message: 'Error.BrandTranslationAlreadyExists',
        path: 'brandId',
    },
]);
