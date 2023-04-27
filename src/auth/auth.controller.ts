import { Controller, Post, Body, Get, Res } from '@nestjs/common';

import { Response } from 'express';

import { AuthService } from './auth.service';

import { CreateUsuarioDto, LoginUsuarioDto } from './dto';

import { GetUser, Auth } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  // @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Res() res: Response) {
    return this.authService.create(createUsuarioDto, res);
  }

  @Post('login')
  loginUser(@Body() loginUsuarioDto: LoginUsuarioDto, @Res() res: Response) {
    return this.authService.login(loginUsuarioDto, res);
  }

  @Post('loginAdmin')
  loginAdmin(@Body() loginUsuarioDto: LoginUsuarioDto, @Res() res: Response) {
    return this.authService.loginAdmin(loginUsuarioDto, res);
  }

  @Get('validateToken')
  @Auth()
  validateToken(@GetUser() user: any) {
    return this.authService.validateToken(user);
  }
}
