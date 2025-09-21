import { SetMetadata } from '@nestjs/common';
import { AUTH_TYPE_KEY } from './auth.decorator';
import { AuthType, ConditionGuard } from '../constants/auth.constant';

export const IsPublic = () => SetMetadata(AUTH_TYPE_KEY, { authTypes: [AuthType.None], options: { condition: ConditionGuard.And } });
