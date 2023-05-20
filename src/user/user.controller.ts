import { Controller, Param, Query, Delete, Get, Res } from '@nestjs/common';
import { Auth, ValidRoles } from 'src/auth/decorators';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getAll')
  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  getAllUsers(@Res() res: Response) {
    return this.userService.getAllUsers(res);
  }

  @Delete('deleteUser')
  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  deleteUser(@Query('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
