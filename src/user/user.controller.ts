import { Controller, Param, Query, Delete, Get } from '@nestjs/common';
import { Auth, ValidRoles } from 'src/auth/decorators';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Get('getAll')
  @Auth( ValidRoles.admin, ValidRoles.superAdmin )
  getAllUsers(@Query() paginationDto:PaginationDto) {
    return this.userService.getAllUsers(paginationDto)
  }

  @Delete('deleteUser')
  @Auth( ValidRoles.admin, ValidRoles.superAdmin )
  deleteUser(@Query('id') id: string){
    return this.userService.deleteUser(id);
  }
}
