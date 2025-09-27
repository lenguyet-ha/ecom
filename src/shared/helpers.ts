import { Prisma } from '@prisma/client';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// Type Predicate
export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

export function isForeignKeyConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003';
}

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateRandomFilename = (filename: string) => {
    const ext = path.extname(filename);
    return `${uuidv4()}${ext}`;
};

export const generateCancelPaymentJobId = (paymentId: number) => {
    return `paymentId-${paymentId}`;
};
