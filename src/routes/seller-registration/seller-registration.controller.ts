import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SellerRegistrationService } from './seller-registration.service';
import {
  CreateSellerRegistrationSchema,
  RejectSellerRegistrationSchema,
  UpdateSellerRegistrationSchema,
} from './seller-registration.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { AuthType } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import type { TokenPayload } from 'src/shared/types/jwt.type';
import { CustomZodValidationPipe } from 'src/shared/pipes/custom-zod-validation.pipe';

@Controller('seller-registration')
export class SellerRegistrationController {
  constructor(private readonly service: SellerRegistrationService) {}

  /**
   * Bước 1: User submit thông tin đăng ký
   * POST /seller-registration/register
   */
  @Auth([AuthType.Bearer])
  @Post('register')
  async register(
    @ActiveUser() user: TokenPayload,
    @Body(new CustomZodValidationPipe(CreateSellerRegistrationSchema))
    body: any,
  ) {
    return this.service.createRegistration(user.userId, body);
  }

  /**
   * Bước 2: Lấy QR code để thanh toán
   * GET /seller-registration/:id/payment-qr
   */
  @Auth([AuthType.Bearer])
  @Get(':id/payment-qr')
  async getPaymentQR(
    @ActiveUser() user: TokenPayload,
    @Param('id', ParseIntPipe) registrationId: number,
  ) {
    return this.service.getPaymentQR(user.userId, registrationId);
  }

    /**
   * Webhook callback khi thanh toán thành công
   * POST /seller-registration/payment-success
   * (Không cần auth vì được gọi từ payment gateway)
   */
  @Auth([AuthType.None])
  @Post('payment-success')
  async handlePaymentSuccess(@Body() body: { paymentId: number }) {
    return this.service.handlePaymentSuccess(body.paymentId);
  }

  /**
   * Webhook callback khi thanh toán thất bại
   * POST /seller-registration/payment-failed
   */
  @Auth([AuthType.None])
  @Post('payment-failed')
  async handlePaymentFailed(@Body() body: { paymentId: number }) {
    return this.service.handlePaymentFailed(body.paymentId);
  }

  /**
   * User xem trạng thái đơn đăng ký
   * GET /seller-registration/status
   */
  @Auth([AuthType.Bearer])
  @Get('status')
  async getStatus(
    @ActiveUser() user: TokenPayload,
    @Query('registrationId', new ParseIntPipe({ optional: true }))
    registrationId?: number,
  ) {
    return this.service.getRegistrationStatus(user.userId, registrationId);
  }

  /**
   * User lấy thông tin chi tiết đơn đăng ký của mình
   * GET /seller-registration/my-registration
   */
  @Auth([AuthType.Bearer])
  @Get('my-registration')
  getMyRegistration(@ActiveUser() user: TokenPayload) {
    return this.service.getMyRegistration(user.userId);
  }

  /**
   * User cập nhật thông tin đơn đăng ký
   * PATCH /seller-registration/:id
   * Chỉ được phép khi chưa được admin duyệt (PENDING_PAYMENT hoặc PENDING_REVIEW)
   */
  @Auth([AuthType.Bearer])
  @Patch(':id')
  updateRegistration(
    @ActiveUser() user: TokenPayload,
    @Param('id', ParseIntPipe) registrationId: number,
    @Body(new CustomZodValidationPipe(UpdateSellerRegistrationSchema))
    body: any,
  ) {
    return this.service.updateRegistration(user.userId, registrationId, body);
  }

  /**
   * Cập nhật trạng thái đơn đăng ký sau khi thanh toán thành công
   * POST /seller-registration/status
   */
  @Auth([AuthType.None])
  @Post('status')
  updateStatus(
    @Query('registrationId', ParseIntPipe) registrationId: number,
  ) {
    return this.service.updateStatusAfterPayment(registrationId);
  }

  /**
   * Admin duyệt đơn đăng ký
   * PUT /admin/seller-registration/:id/approve
   */
  @Auth([AuthType.Bearer])
  @Put('admin/:id/approve')
  async approveRegistration(
    @ActiveUser() user: TokenPayload,
    @Param('id', ParseIntPipe) registrationId: number,
  ) {
    return this.service.approveRegistration(registrationId, user.userId);
  }

  /**
   * Admin từ chối đơn đăng ký
   * PUT /admin/seller-registration/:id/reject
   */
  @Auth([AuthType.Bearer])
  @Put('admin/:id/reject')
  async rejectRegistration(
    @ActiveUser() user: TokenPayload,
    @Param('id', ParseIntPipe) registrationId: number,
    @Body(new CustomZodValidationPipe(RejectSellerRegistrationSchema))
    body: any,
  ) {
    return this.service.rejectRegistration(registrationId, user.userId, body.rejectionReason);
  }

  /**
   * Admin xem danh sách đơn chờ duyệt (phân trang)
   * GET /admin/seller-registration/pending
   */
  @Auth([AuthType.Bearer])
  @Get('admin/pending')
  async getPendingApprovals(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.service.getPendingApprovals(page || 1, limit || 20);
  }

  /**
   * Admin xem tất cả đơn theo status
   * GET /admin/seller-registration/by-status?status=PENDING_REVIEW
   */
  @Auth([AuthType.Bearer])
  @Get('admin/by-status')
  async getByStatus(@Query('status') status: string) {
    return this.service.getRegistrationsByStatus(status);
  }

  /**
   * Admin xem tất cả đơn đăng ký (phân trang + có thể lọc theo status)
   * GET /admin/seller-registration/registrations?page=1&limit=10&status=APPROVED
   */
  @Auth([AuthType.Bearer])
  @Get('admin/registrations')
  async getAllRegistrations(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: string,
  ) {
    return this.service.getAllRegistrations(page || 1, limit || 10, status);
  }

  /**
   * Admin xem chi tiết 1 đơn đăng ký cụ thể
   * GET /seller-registration/admin/:id
   */
  @Auth([AuthType.Bearer])
  @Get('admin/:id')
  async getRegistrationDetail(
    @Param('id', ParseIntPipe) registrationId: number,
  ) {
    return this.service.getRegistrationDetail(registrationId);
  }
}
