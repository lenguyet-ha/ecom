import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

export const CategoryTranslationNotFoundException = new NotFoundException([
    {
        message: 'Error.CategoryTranslationNotFound',
        path: 'categoryTranslationId',
    },
]);

export const CategoryTranslationAlreadyExistsException = new UnprocessableEntityException([
    {
        message: 'Error.CategoryTranslationAlreadyExists',
        path: 'categoryId',
    },
]);
