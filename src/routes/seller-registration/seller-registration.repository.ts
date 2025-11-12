import { Injectable } from '@nestjs/common';
import { PrismaClient, SellerRegistration, SellerRegistrationStatus } from '@prisma/client';

@Injectable()
export class SellerRegistrationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create({
    userId,
    data,
  }: {
    userId: number;
    data: {
      citizenId: string;
      citizenIdFrontImage: string;
      citizenIdBackImage: string;
      address: string;
      bankAccountNumber: string;
      bankName: string;
      bankAccountName: string;
      registrationFee?: number;
    };
  }): Promise<SellerRegistration> {
    return await this.prisma.sellerRegistration.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async findById(id: number): Promise<SellerRegistration | null> {
    return await this.prisma.sellerRegistration.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        payment: true,
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: number): Promise<SellerRegistration | null> {
    return await this.prisma.sellerRegistration.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        payment: true,
      },
    });
  }

  async findLatestByUserId(userId: number): Promise<SellerRegistration | null> {
    return await this.prisma.sellerRegistration.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        payment: true,
      },
    });
  }

  async findByStatus(status: SellerRegistrationStatus): Promise<SellerRegistration[]> {
    return await this.prisma.sellerRegistration.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        payment: true,
      },
    });
  }

  async updateStatus({
    id,
    status,
    approvedById,
    rejectionReason,
  }: {
    id: number;
    status: SellerRegistrationStatus;
    approvedById?: number;
    rejectionReason?: string;
  }): Promise<SellerRegistration> {
    return await this.prisma.sellerRegistration.update({
      where: { id },
      data: {
        status,
        approvedById,
        rejectionReason,
        approvedAt: approvedById ? new Date() : undefined,
      },
    });
  }

  async updatePaymentId({
    id,
    paymentId,
  }: {
    id: number;
    paymentId: number;
  }): Promise<SellerRegistration> {
    return await this.prisma.sellerRegistration.update({
      where: { id },
      data: { paymentId },
    });
  }

  async update({
    id,
    data,
  }: {
    id: number;
    data: {
      citizenId?: string;
      citizenIdFrontImage?: string;
      citizenIdBackImage?: string;
      address?: string;
      bankAccountNumber?: string;
      bankName?: string;
      bankAccountName?: string;
    };
  }): Promise<SellerRegistration> {
    return await this.prisma.sellerRegistration.update({
      where: { id },
      data,
    });
  }

  async getPendingApprovals(limit: number = 20, offset: number = 0): Promise<{
    data: SellerRegistration[];
    total: number;
  }> {
    const [data, total] = await Promise.all([
      this.prisma.sellerRegistration.findMany({
        where: { status: 'PENDING_REVIEW' },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
        include: {
          user: true,
          payment: true,
        },
      }),
      this.prisma.sellerRegistration.count({
        where: { status: 'PENDING_REVIEW' },
      }),
    ]);

    return { data, total };
  }

  async getAllRegistrations(
    limit: number = 20, 
    offset: number = 0,
    status?: SellerRegistrationStatus
  ): Promise<{
    data: SellerRegistration[];
    total: number;
  }> {
    const where = status ? { status } : {};
    
    const [data, total] = await Promise.all([
      this.prisma.sellerRegistration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          payment: true,
          approvedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.sellerRegistration.count({ where }),
    ]);

    return { data, total };
  }
}
