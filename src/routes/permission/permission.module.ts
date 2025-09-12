import { Module } from '@nestjs/common';
import { PermissionController } from 'src/routes/permission/permission.controller';

import { PermissionService } from 'src/routes/permission/permission.service';
import { PermissionRepo } from 'src/shared/repositories/permission.repo';

@Module({
    providers: [PermissionService, PermissionRepo],
    controllers: [PermissionController],
})
export class PermissionModule {}
