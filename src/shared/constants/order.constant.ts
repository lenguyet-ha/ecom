export const OrderStatus = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PENDING_PICKUP: 'PENDING_PICKUP',
    PENDING_DELIVERY: 'PENDING_DELIVERY',
    DELIVERED: 'DELIVERED',
    RETURNED: 'RETURNED',
    CANCELLED: 'CANCELLED',
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];
export const PaymentStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
