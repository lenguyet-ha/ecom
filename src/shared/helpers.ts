import { Prisma } from '@prisma/client';

// Type Predicate
export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
