import { Injectable } from '@nestjs/common';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { BrandTranslationNotFoundException } from './brand-translation.error';
import { CreateBrandTranslationBodyType, UpdateBrandTranslationBodyType, GetBrandTranslationsQueryType } from './brand-translation.dto';
import { BrandTranslationRepository } from 'src/shared/repositories/brand-translation.repository';

@Injectable()
export class BrandTranslationService {
    constructor(private brandTranslationRepository: BrandTranslationRepository) {}

    async list(pagination: GetBrandTranslationsQueryType) {
        const data = await this.brandTranslationRepository.list(pagination);
        return data;
    }

    async findByBrandId(brandId: number) {
        const data = await this.brandTranslationRepository.findByBrandId(brandId);
        return {
            data,
            totalItems: data.length,
        };
    }

    async findById(id: number) {
        const brandTranslation = await this.brandTranslationRepository.findById(id);
        if (!brandTranslation) {
            throw BrandTranslationNotFoundException;
        }
        return brandTranslation;
    }

    async create({ data, createdById }: { data: CreateBrandTranslationBodyType; createdById: number }) {
        try {
            return await this.brandTranslationRepository.create({
                createdById,
                data,
            });
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw BrandTranslationNotFoundException;
            }
            throw error;
        }
    }

    async update({ id, data, updatedById }: { id: number; data: UpdateBrandTranslationBodyType; updatedById: number }) {
        try {
            const brandTranslation = await this.brandTranslationRepository.update({
                id,
                updatedById,
                data,
            });
            return brandTranslation;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw BrandTranslationNotFoundException;
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            // soft delete
            await this.brandTranslationRepository.delete(id, false);
            return {
                message: 'Delete successfully',
            };
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw BrandTranslationNotFoundException;
            }
            throw error;
        }
    }
}
