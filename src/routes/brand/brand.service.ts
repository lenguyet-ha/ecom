import { Injectable } from '@nestjs/common';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { BrandNotFoundException } from './brand.error';
import { CreateBrandBodyType, UpdateBrandBodyType, GetBrandsQueryType } from './brand.dto';
import { BrandRepository } from 'src/shared/repositories/brand.repository';

@Injectable()
export class BrandService {
    constructor(private brandRepository: BrandRepository) {}

    async list(pagination: GetBrandsQueryType) {
        const result = await this.brandRepository.list(pagination);

        // Serialize data to exclude unwanted fields and filter Vietnamese translations
        const serializedData = result.data.map((brand) => {
            const vietnameseTranslation = brand.brandTranslations?.find(
                (translation) => translation.languageId === 'vi',
            );

            return {
                id: brand.id,
                logo: brand.logo,
                name: brand.name,

                description: vietnameseTranslation?.description,
            };
        });

        return {
            ...result,
            data: serializedData,
        };
    }

    async findById(id: number) {
        const brand = await this.brandRepository.findById(id);
        if (!brand) {
            throw BrandNotFoundException;
        }

        // Filter brandTranslations to only include Vietnamese translations and serialize
        const vietnameseTranslation = brand.brandTranslations?.find((translation) => translation.languageId === 'vi');

        // Serialize response to exclude unwanted fields
        return {
            id: brand.id,
            logo: brand.logo,
            name: brand.name,
            description: vietnameseTranslation?.description,
        };
    }

    async create({ data, createdById }: { data: CreateBrandBodyType; createdById: number }) {
        try {
            return await this.brandRepository.create({
                createdById,
                data,
            });
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw BrandNotFoundException;
            }
            throw error;
        }
    }

    async update({ id, data, updatedById }: { id: number; data: UpdateBrandBodyType; updatedById: number }) {
        try {
            const brand = await this.brandRepository.update({
                id,
                updatedById,
                data,
            });
            return brand;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw BrandNotFoundException;
            }
            throw error;
        }
    }

    async delete(id: number) {
        try {
            // soft delete
            await this.brandRepository.delete(id, false);
            return {
                message: 'Delete successfully',
            };
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw BrandNotFoundException;
            }
            throw error;
        }
    }
}
