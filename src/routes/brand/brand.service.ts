import { Injectable } from '@nestjs/common';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { BrandNotFoundException } from './brand.error';
import { CreateBrandBodyType, UpdateBrandBodyType, GetBrandsQueryType } from './brand.dto';
import { BrandRepository } from 'src/shared/repositories/brand.repository';

@Injectable()
export class BrandService {
    constructor(private brandRepository: BrandRepository) {}

    async list(pagination: GetBrandsQueryType) {
        const data = await this.brandRepository.list(pagination);
        return data;
    }

    async findById(id: number) {
        const brand = await this.brandRepository.findById(id);
        if (!brand) {
            throw BrandNotFoundException;
        }
        return brand;
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
