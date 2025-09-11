export interface TokenPayload {
    userId: number;
    iat: number;
    exp: number;
    roleId: number;
    roleName: string;
}

export interface RefreshTokenPayload {
    userId: number;
    iat: number;
    exp: number;
}
