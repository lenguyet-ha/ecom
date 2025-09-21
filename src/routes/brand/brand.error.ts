import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

export const BrandNotFoundException = new NotFoundException([
    {
        message: 'Error.BrandNotFound',
        path: 'brandId',
    },
]);

export const BrandAlreadyExistsException = new UnprocessableEntityException([
    {
        message: 'Error.BrandAlreadyExists',
        path: 'name',
    },
]);
