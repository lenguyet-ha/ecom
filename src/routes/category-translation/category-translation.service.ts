import { Injectable } from '@nestjs/common';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { CategoryTranslationNotFoundException } from './category-translation.error';
import {
    CreateCategoryTranslationBodyType,
    UpdateCategoryTranslationBodyType,
    GetCategoryTranslationsQueryType,
} from './category-translation.dto';
import { CategoryTranslationRepository } from 'src/shared/repositories/category-translation.repository';

@Injectable()
export class CategoryTranslationService {
    constructor(private categoryTranslationRepository: CategoryTranslationRepository) {}

    async list(pagination: GetCategoryTranslationsQueryType) {
        const data = await this.categoryTranslationRepository.list(pagination);
        return data;
    }

    async findByCategoryId(categoryId: number) {
        const data = await this.categoryTranslationRepository.findByCategoryId(categoryId);
        return {
            data,
            totalItems: data.length,
        };
    }

    async findById(id: number) {
        const categoryTranslation = await this.categoryTranslationRepository.findById(id);
        if (!categoryTranslation) {
            throw CategoryTranslationNotFoundException;
        }
        return categoryTranslation;
    }

    async create({ data, createdById }: { data: CreateCategoryTranslationBodyType; createdById: number }) {
        try {
            return await this.categoryTranslationRepository.create({
                createdById,
                data,
            });
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw CategoryTranslationNotFoundException;
            }
            throw error;
        }
    }

    async update({
        id,
        data,
        updatedById,
    }: {
        id: number;
        data: UpdateCategoryTranslationBodyType;
        updatedById: number;
    }) {
        try {
            const categoryTranslation = await this.categoryTranslationRepository.update({
                id,
                updatedById,
                data,
            });
            return categoryTranslation;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw CategoryTranslationNotFoundException;
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            // soft delete
            await this.categoryTranslationRepository.delete(id, false);
            return {
                message: 'Delete successfully',
            };
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw CategoryTranslationNotFoundException;
            }
            throw error;
        }
    }
}
