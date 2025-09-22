import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

export const CategoryNotFoundException = new NotFoundException([
    {
        message: 'Error.CategoryNotFound',
        path: 'categoryId',
    },
]);

export const CategoryAlreadyExistsException = new UnprocessableEntityException([
    {
        message: 'Error.CategoryAlreadyExists',
        path: 'name',
    },
]);
