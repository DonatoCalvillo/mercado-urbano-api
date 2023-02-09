import { Controller, Post, Body, Get, Query } from '@nestjs/common';

import { AuthService } from './auth.service';

import { CreateUsuarioDto, LoginUsuarioDto } from './dto';

import { GetUser, ValidRoles, Auth } from './decorators';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  // @Auth( ValidRoles.admin, ValidRoles.superAdmin )
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.create(createUsuarioDto);
  }
  
  @Post('login')
  loginUser(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.authService.login(loginUsuarioDto);
  }

  @Post('loginAdmin')
  loginAdmin(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.authService.loginAdmin(loginUsuarioDto);
  }

  @Get('validateToken')
  @Auth( )
  validateToken(
    @GetUser() user: any,
  ) {
    return this.authService.validateToken(user);
  }
}
