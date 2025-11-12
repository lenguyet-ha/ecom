import { z } from 'zod';

export const CreateSellerRegistrationSchema = z.object({
  citizenId: z.string().min(9).max(20).describe('CCCD/CMND'),
  citizenIdFrontImage: z.string().url().describe('URL ảnh mặt trước CCCD'),
  citizenIdBackImage: z.string().url().describe('URL ảnh mặt sau CCCD'),
  address: z.string().min(10).max(500).describe('Địa chỉ đầy đủ'),
  bankAccountNumber: z.string().min(8).max(30).describe('Số tài khoản ngân hàng'),
  bankName: z.string().min(2).max(200).describe('Tên ngân hàng'),
  bankAccountName: z.string().min(2).max(200).describe('Tên chủ tài khoản'),
});

export const ApproveSellerRegistrationSchema = z.object({
  registrationId: z.number().int().positive(),
});

export const RejectSellerRegistrationSchema = z.object({
  registrationId: z.number().int().positive(),
  rejectionReason: z.string().min(5).max(500).describe('Lý do từ chối'),
});

export const GetSellerRegistrationStatusSchema = z.object({
  registrationId: z.number().int().positive().optional(),
});

export const UpdateSellerRegistrationSchema = z.object({
  citizenId: z.string().min(9).max(20).describe('CCCD/CMND').optional(),
  citizenIdFrontImage: z.string().url().describe('URL ảnh mặt trước CCCD').optional(),
  citizenIdBackImage: z.string().url().describe('URL ảnh mặt sau CCCD').optional(),
  address: z.string().min(10).max(500).describe('Địa chỉ đầy đủ').optional(),
  bankAccountNumber: z.string().min(8).max(30).describe('Số tài khoản ngân hàng').optional(),
  bankName: z.string().min(2).max(200).describe('Tên ngân hàng').optional(),
  bankAccountName: z.string().min(2).max(200).describe('Tên chủ tài khoản').optional(),
});

export type CreateSellerRegistrationBody = z.infer<typeof CreateSellerRegistrationSchema>;
export type ApproveSellerRegistrationBody = z.infer<typeof ApproveSellerRegistrationSchema>;
export type RejectSellerRegistrationBody = z.infer<typeof RejectSellerRegistrationSchema>;
export type GetSellerRegistrationStatusQuery = z.infer<typeof GetSellerRegistrationStatusSchema>;
export type UpdateSellerRegistrationBody = z.infer<typeof UpdateSellerRegistrationSchema>;
