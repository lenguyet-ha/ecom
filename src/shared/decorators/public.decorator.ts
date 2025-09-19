import { SetMetadata } from '@nestjs/common';
import { AUTH_TYPE_KEY } from './auth.decorator';
import { AuthType } from '../constants/auth.constant';

export const IsPublic = () => SetMetadata(AUTH_TYPE_KEY, { authTypes: [AuthType.None] });
