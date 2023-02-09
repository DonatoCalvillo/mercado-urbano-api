import { Controller, Query } from '@nestjs/common';
import { Get } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Get('getAll')
  getAllUsers(@Query() paginationDto:PaginationDto) {
    return this.userService.getAllUsers(paginationDto)
  }

}
