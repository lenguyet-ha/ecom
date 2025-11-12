import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SellerRegistrationRepository } from './seller-registration.repository';
import { CreateSellerRegistrationBody, UpdateSellerRegistrationBody } from './seller-registration.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SellerRegistrationService {
  constructor(
    private readonly repository: SellerRegistrationRepository,
    private readonly prisma: PrismaClient,
  ) {}

  /**
   * Bước 1: User submit thông tin đăng ký
   * Tạo SellerRegistration record với status PENDING_PAYMENT
   */
  async createRegistration(userId: number, body: CreateSellerRegistrationBody) {
    // Kiểm tra user đã có đơn đăng ký chưa
    const existingRegistration = await this.repository.findByUserId(userId);
    
    if (existingRegistration) {
      if (existingRegistration.status === 'PENDING_PAYMENT') {
        throw new BadRequestException(
          'Bạn đã có đơn đăng ký đang chờ thanh toán. Vui lòng thanh toán trước',
        );
      }
      if (existingRegistration.status === 'PENDING_REVIEW') {
        throw new BadRequestException(
          'Đơn đăng ký của bạn đang chờ duyệt từ admin',
        );
      }
      if (existingRegistration.status === 'APPROVED') {
        throw new BadRequestException(
          'Bạn đã là seller rồi',
        );
      }
    }

    // Tạo registration mới
    const registration = await this.repository.create({
      userId,
      data: body,
    });

    return {
      id: registration.id,
      status: registration.status,
      registrationFee: registration.registrationFee,
      message: 'Đăng ký thành công, vui lòng thanh toán để hoàn tất',
    };
  }

  /**
   * Bước 2: Get mã QR để thanh toán
   * Link SellerRegistration với Payment
   */
  async getPaymentQR(userId: number, registrationId: number) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký');
    }

    if (registration.userId !== userId) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    if (registration.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(
        `Chỉ có thể thanh toán khi đơn ở trạng thái PENDING_PAYMENT, hiện tại: ${registration.status}`,
      );
    }

    if (registration.paymentId) {
      throw new BadRequestException('Đơn này đã được link với payment rồi');
    }

    // Tạo Payment record
    const payment = await this.prisma.payment.create({
      data: {
        status: 'PENDING',
      },
    });

    // Link SellerRegistration với Payment
    await this.repository.updatePaymentId({
      id: registrationId,
      paymentId: payment.id,
    });

    return {
      paymentId: payment.id,
      registrationId,
      amount: registration.registrationFee,
      message: 'QR code sẽ được tạo từ payment gateway (Momo/VNPay)',
      // Trong thực tế, gọi payment gateway ở đây để lấy QR
      // qrCode: await paymentGateway.createQR(payment.id, registration.registrationFee)
    };
  }

  /**
   * Bước 3: Thanh toán thành công (callback từ payment gateway)
   */
  async handlePaymentSuccess(paymentId: number) {
    // Cập nhật payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'SUCCESS' },
    });

    // Tìm SellerRegistration liên kết với payment này
    const registration = await this.prisma.sellerRegistration.findFirst({
      where: { paymentId },
    });

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký cho payment này');
    }

    // Cập nhật status thành PENDING_REVIEW
    await this.repository.updateStatus({
      id: registration.id,
      status: 'PENDING_REVIEW',
    });

    return {
      registrationId: registration.id,
      status: 'PENDING_REVIEW',
      message: 'Thanh toán thành công! Đơn đăng ký của bạn đang chờ duyệt từ admin',
    };
  }

  /**
   * Thanh toán thất bại (callback từ payment gateway)
   */
  async handlePaymentFailed(paymentId: number) {
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED' },
    });

    return {
      message: 'Thanh toán thất bại. Vui lòng thử lại',
    };
  }

  /**
   * Cập nhật trạng thái đơn đăng ký sau khi thanh toán thành công
   * (Được gọi từ frontend sau khi thanh toán)
   */
  async updateStatusAfterPayment(registrationId: number) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký');
    }

    // Kiểm tra payment đã thành công chưa
    if (!registration.paymentId) {
      throw new BadRequestException('Đơn đăng ký chưa có payment');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: registration.paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy payment');
    }

    // if (payment.status !== 'SUCCESS') {
    //   throw new BadRequestException(
    //     `Payment chưa thành công. Trạng thái hiện tại: ${payment.status}`,
    //   );
    // }

    // Nếu đã là PENDING_REVIEW rồi thì return
    if (registration.status === 'PENDING_REVIEW') {
      return {
        registrationId: registration.id,
        status: 'PENDING_REVIEW',
        message: 'Đơn đăng ký đang chờ duyệt từ admin',
      };
    }

    // Cập nhật status thành PENDING_REVIEW
    await this.repository.updateStatus({
      id: registration.id,
      status: 'PENDING_REVIEW',
    });

    return {
      registrationId: registration.id,
      status: 'PENDING_REVIEW',
      message: 'Thanh toán thành công! Đơn đăng ký của bạn đang chờ duyệt từ admin',
    };
  }

  /**
   * Admin duyệt đơn đăng ký
   */
  async approveRegistration(registrationId: number, adminId: number) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký');
    }

    if (registration.status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Chỉ có thể duyệt khi đơn ở trạng thái PENDING_REVIEW, hiện tại: ${registration.status}`,
      );
    }

    // Cập nhật status thành APPROVED
    await this.repository.updateStatus({
      id: registrationId,
      status: 'APPROVED',
      approvedById: adminId,
    });

    // Update user role thành SELLER
    // Giả sử SELLER_ROLE_ID = 3 (cần điều chỉnh theo hệ thống của bạn)
    const sellerRole = await this.prisma.role.findFirst({
      where: { name: 'SELLER' },
    });

    if (!sellerRole) {
      throw new NotFoundException('Không tìm thấy SELLER role');
    }

    await this.prisma.user.update({
      where: { id: registration.userId },
      data: { roleId: sellerRole.id },
    });

    return {
      registrationId,
      status: 'APPROVED',
      userId: registration.userId,
      message: 'Đơn đăng ký đã được duyệt. User hiện là SELLER',
    };
  }

  /**
   * Admin từ chối đơn đăng ký
   */
  async rejectRegistration(
    registrationId: number,
    adminId: number,
    rejectionReason: string,
  ) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký');
    }

    if (registration.status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Chỉ có thể từ chối khi đơn ở trạng thái PENDING_REVIEW, hiện tại: ${registration.status}`,
      );
    }

    // Cập nhật status thành REJECTED
    await this.repository.updateStatus({
      id: registrationId,
      status: 'REJECTED',
      approvedById: adminId,
      rejectionReason,
    });

    return {
      registrationId,
      status: 'REJECTED',
      rejectionReason,
      message: 'Đơn đăng ký đã bị từ chối',
    };
  }

  /**
   * User xem trạng thái đơn đăng ký của mình
   */
  async getRegistrationStatus(userId: number, registrationId?: number) {
    let registration;

    if (registrationId) {
      registration = await this.repository.findById(registrationId);

      if (!registration) {
        throw new NotFoundException('Không tìm thấy đơn đăng ký');
      }

      if (registration.userId !== userId) {
        throw new ForbiddenException('Không có quyền truy cập');
      }
    } else {
      // Lấy đơn đăng ký mới nhất của user
      registration = await this.repository.findLatestByUserId(userId);

      if (!registration) {
        throw new NotFoundException('Bạn chưa tạo đơn đăng ký nào');
      }
    }

    return {
      id: registration.id,
      status: registration.status,
      citizenId: registration.citizenId,
      address: registration.address,
      registrationFee: registration.registrationFee,
      rejectionReason: registration.rejectionReason,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt,
      approvedAt: registration.approvedAt,
      paymentStatus: registration.payment?.status || null,
    };
  }

  /**
   * User lấy thông tin chi tiết đơn đăng ký của mình
   * GET /seller-registration/my-registration
   */
  async getMyRegistration(userId: number) {
    const registration = await this.repository.findByUserId(userId);

    if (!registration) {
      throw new NotFoundException('Bạn chưa tạo đơn đăng ký nào');
    }

    // Get payment status if paymentId exists
    let paymentStatus: string | null = null;
    if (registration.paymentId) {
      const payment = await this.prisma.payment.findUnique({
        where: { id: registration.paymentId },
      });
      paymentStatus = payment?.status || null;
    }

    return {
      id: registration.id,
      status: registration.status,
      citizenId: registration.citizenId,
      citizenIdFrontImage: registration.citizenIdFrontImage,
      citizenIdBackImage: registration.citizenIdBackImage,
      address: registration.address,
      bankAccountNumber: registration.bankAccountNumber,
      bankName: registration.bankName,
      bankAccountName: registration.bankAccountName,
      registrationFee: registration.registrationFee,
      rejectionReason: registration.rejectionReason,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt,
      approvedAt: registration.approvedAt,
      paymentId: registration.paymentId,
      paymentStatus,
    };
  }

  /**
   * User cập nhật thông tin đơn đăng ký
   * Chỉ được phép khi status là PENDING_PAYMENT hoặc PENDING_REVIEW
   */
  async updateRegistration(
    userId: number,
    registrationId: number,
    data: UpdateSellerRegistrationBody,
  ) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký');
    }

    if (registration.userId !== userId) {
      throw new ForbiddenException('Không có quyền cập nhật đơn đăng ký này');
    }

    // Chỉ cho phép cập nhật khi chưa được duyệt
    if (registration.status !== 'PENDING_PAYMENT' && registration.status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Không thể cập nhật đơn đăng ký khi đã ${registration.status}. Chỉ có thể cập nhật khi đơn đang chờ thanh toán hoặc chờ duyệt.`,
      );
    }

    // Cập nhật thông tin
    const updated = await this.repository.update({
      id: registrationId,
      data,
    });

    return {
      id: updated.id,
      status: updated.status,
      citizenId: updated.citizenId,
      address: updated.address,
      bankAccountNumber: updated.bankAccountNumber,
      bankName: updated.bankName,
      bankAccountName: updated.bankAccountName,
      message: 'Cập nhật thông tin đơn đăng ký thành công',
    };
  }

  /**
   * Admin xem danh sách đơn chờ duyệt
   */
  async getPendingApprovals(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const { data, total } = await this.repository.getPendingApprovals(limit, offset);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin xem tất cả đơn theo status
   */
  async getRegistrationsByStatus(status: string) {
    const validStatuses = ['PENDING_PAYMENT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Status không hợp lệ: ${status}`);
    }

    const registrations = await this.repository.findByStatus(status as any);

    return {
      status,
      total: registrations.length,
      data: registrations,
    };
  }

  /**
   * Admin xem tất cả đơn đăng ký (với phân trang)
   */
  async getAllRegistrations(page: number = 1, limit: number = 10, status?: string) {
    if (status) {
      const validStatuses = ['PENDING_PAYMENT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestException(`Status không hợp lệ: ${status}`);
      }
    }

    const offset = (page - 1) * limit;
    const { data, total } = await this.repository.getAllRegistrations(
      limit, 
      offset,
      status as any
    );

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin xem chi tiết 1 đơn đăng ký
   */
  async getRegistrationDetail(registrationId: number) {
    const registration = await this.repository.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký');
    }

    return registration;
  }
}
