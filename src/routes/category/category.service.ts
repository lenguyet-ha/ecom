import { Injectable } from '@nestjs/common';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { CategoryNotFoundException } from './category.error';
import { CreateCategoryBodyType, UpdateCategoryBodyType, GetCategoriesQueryType } from './category.dto';
import { CategoryRepository } from 'src/shared/repositories/category.repository';

@Injectable()
export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) {}

    async list(pagination: GetCategoriesQueryType) {
        const result = await this.categoryRepository.list(pagination);

        // Serialize data to exclude unwanted fields and filter translations
        const serializedData = result.data.map((category) => {
            // Filter categoryTranslations to only include Vietnamese translations
            const vietnameseTranslation = category.categoryTranslations?.find(
                (translation) => translation.languageId === 'vi',
            );

            return {
                id: category.id,
                logo: category.logo,
                name: category.name,
                parentCategoryId: category.parentCategoryId,

                description: vietnameseTranslation?.description,

                parentCategory: category.parentCategory
                    ? {
                          id: category.parentCategory.id,
                          name: category.parentCategory.name,
                          logo: category.parentCategory.logo,
                      }
                    : null,
                childrenCategories: category.childrenCategories?.map((child) => ({
                    id: child.id,
                    name: child.name,
                    logo: child.logo,
                })),
            };
        });

        return {
            ...result,
            data: serializedData,
        };
    }

    async findById(id: number) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw CategoryNotFoundException;
        }

        // Filter categoryTranslations to only include Vietnamese translations and serialize
        const vietnameseTranslation = category.categoryTranslations?.find(
            (translation) => translation.languageId === 'vi',
        );

        // Serialize response to exclude unwanted fields
        return {
            id: category.id,
            logo: category.logo,
            name: category.name,
            parentCategoryId: category.parentCategoryId,

            description: vietnameseTranslation?.description,
            categoryTranslationId: vietnameseTranslation?.id,

            parentCategory: category.parentCategory
                ? {
                      id: category.parentCategory.id,
                      name: category.parentCategory.name,
                      logo: category.parentCategory.logo,
                  }
                : undefined,
            childrenCategories: category.childrenCategories?.map((child) => ({
                id: child.id,
                name: child.name,
                logo: child.logo,
            })),
        };
    }

    async create({ data, createdById }: { data: CreateCategoryBodyType; createdById: number }) {
        try {
            const res = await this.categoryRepository.create({
                createdById,
                data,
            });

            return {
                categoryId: res.id,
                message: 'Create successfully',
                status: '201',
            };
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw CategoryNotFoundException;
            }
            throw error;
        }
    }

    async update({ id, data, updatedById }: { id: number; data: UpdateCategoryBodyType; updatedById: number }) {
        try {
            const category = await this.categoryRepository.update({
                id,
                updatedById,
                data,
            });
            return category;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw CategoryNotFoundException;
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            // soft delete
            await this.categoryRepository.delete(id, false);
            return {
                success: true,
                message: 'Delete successfully',
            };
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw CategoryNotFoundException;
            }
            throw error;
        }
    }
}
