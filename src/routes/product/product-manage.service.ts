import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { GetManageProductsQueryDTO } from './product.dto';
import * as jwtType from 'src/shared/types/jwt.type';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { isNotFoundPrismaError } from 'src/shared/helpers';

@Injectable()
export class ManageProductService {
    constructor(private productRepo: ProductRepository) {}

    /**
     * Kiểm tra nếu người dùng không phải là người tạo sản phẩm hoặc admin thì không cho tiếp tục
     */
    validatePrivilege({
        userIdResquest,
        roleNameRequest,
        createdById,
    }: {
        userIdResquest: number;
        roleNameRequest: string;
        createdById: number | null;
    }) {
        if (roleNameRequest !== 'ADMIN' && userIdResquest !== createdById) {
            throw new Error('Bạn không có quyền thực hiện hành động này');
        }
        return true;
    }

    /**
     * @description: Xem danh sách sản phẩm của một shop, bắt buộc phải truyền query param là `createdById`
     */
    async list(props: { query: GetManageProductsQueryDTO; userIdRequest: number; roleNameRequest: string }) {
        const { query, userIdRequest, roleNameRequest } = props;
        this.validatePrivilege({
            userIdResquest: userIdRequest,
            roleNameRequest,
            createdById: query.createdById || null,
        });
        const data = await this.productRepo.getList(query);
        return data;
    }

    async getDetail(props: { productId: number; userIdRequest: number; roleNameRequest: string }) {
        const { productId, userIdRequest, roleNameRequest } = props;
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }
        this.validatePrivilege({
            userIdResquest: userIdRequest,
            roleNameRequest,
            createdById: product.createdById || null,
        });
        return product;
    }

    async create({ data, createdById }: { data: any; createdById: number }) {
        return this.productRepo.create({ data, createdById });
    }

    async update({
        productId,
        data,
        updatedById,
        roleNameRequest,
    }: {
        productId: number;
        data: any;
        updatedById: number;
        roleNameRequest: string;
    }) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }
        this.validatePrivilege({
            userIdResquest: updatedById,
            roleNameRequest,
            createdById: product.createdById || null,
        });

        try {
            const updatedProduct = await this.productRepo.update({ id: productId, data, updatedById });
            return updatedProduct;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new Error('Sản phẩm không tồn tại');
            }
            throw error;
        }
    }

    async delete({
        productId,
        deletedById,
        roleNameRequest,
    }: {
        productId: number;
        deletedById: number;
        roleNameRequest: string;
    }) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }
        this.validatePrivilege({
            userIdResquest: deletedById,
            roleNameRequest,
            createdById: product.createdById || null,
        });

        try {
            await this.productRepo.delete({ id: productId, deletedById });
            return {
                message: 'Xoá sản phẩm thành công',
            };
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new Error('Sản phẩm không tồn tại');
            }
            throw error;
        }
    }
}
