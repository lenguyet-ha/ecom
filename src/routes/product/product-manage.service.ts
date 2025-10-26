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
     * @description: Xem danh sách sản phẩm của một shop. Seller chỉ xem sản phẩm của mình, Admin có thể xem tất cả hoặc lọc theo createdById
     */
    async list(props: { query: GetManageProductsQueryDTO; userIdRequest: number; roleNameRequest: string }) {
        const { query, userIdRequest, roleNameRequest } = props;

        // Nếu không truyền createdById, mặc định lấy sản phẩm của user hiện tại (đối với seller)
        // Admin có thể xem tất cả hoặc lọc theo createdById nếu có
        const effectiveCreatedById = query.createdById || (roleNameRequest !== 'ADMIN' ? userIdRequest : undefined);

        this.validatePrivilege({
            userIdResquest: userIdRequest,
            roleNameRequest,
            createdById: effectiveCreatedById || null,
        });

        const data = await this.productRepo.getList({
            ...query,
            createdById: effectiveCreatedById,
        });
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

    async create({ data, createdById, roleName }: { data: any; createdById: number; roleName: string }) {
        // Determine product status based on user role
        // Admin creates products with ACTIVE status
        // Seller creates products with WAITING_ACTIVE status (needs admin approval)
        const status = roleName === 'ADMIN' ? 'ACTIVE' : 'WAITING_ACTIVE';

        return this.productRepo.create({ data: { ...data, status }, createdById });
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

    async updateStatus({
        productId,
        status,
        updatedById,
        roleNameRequest,
    }: {
        productId: number;
        status: string;
        updatedById: number;
        roleNameRequest: string;
    }) {
        // Only admin can update product status
        if (roleNameRequest !== 'ADMIN') {
            throw new Error('Chỉ admin mới có quyền cập nhật trạng thái sản phẩm');
        }

        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        try {
            const updatedProduct = await this.productRepo.updateStatus({ id: productId, status, updatedById });
            return updatedProduct;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new Error('Sản phẩm không tồn tại');
            }
            throw error;
        }
    }
}
