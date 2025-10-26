import { Body, Controller, Get, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ChangePasswordBodyDTO, UpdateMeBodyDTO } from 'src/routes/profile/profile.dto';
import { IsPublic } from 'src/shared/decorators/public.decorator';

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get()
  //  @IsPublic()
    getProfile(@ActiveUser('userId') userId: number) {
        return this.profileService.getProfile(userId);
    }

    @Put()
    updateProfile(@Body() body: UpdateMeBodyDTO, @ActiveUser('userId') userId: number) {
        return this.profileService.updateProfile({
            userId,
            body,
        });
    }

    @Put('change-password')
    changePassword(@Body() body: ChangePasswordBodyDTO, @ActiveUser('userId') userId: number) {
        return this.profileService.changePassword({
            userId,
            body,
        });
    }
}
