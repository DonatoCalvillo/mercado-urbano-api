import { Controller, Post, Body, Get } from '@nestjs/common';
import { Req, SetMetadata, UseGuards } from '@nestjs/common/decorators';

import { AuthService } from './auth.service';
import { CreateUsuarioDto, LoginUsuarioDto } from './dto';
import { Cookies } from './decorators/get-cookies.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { RowHeaders } from './decorators/raw-headers.decorator';
import { RoleProtected, ValidRoles } from './decorators/role-protected.decorator';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.create(createUsuarioDto);
  }
  
  @Post('login')
  loginUser(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.authService.login(loginUsuarioDto);
  }

  @Get('validateToken')
  // @RoleProtected( ValidRoles.admin )
  // @SetMetadata('roles', ['admin'])
  // @UseGuards(AuthGuard(), UserRoleGuard)
  // validateToken(@Cookies('token') token: string) {
  @Auth( ValidRoles.admin )
  validateToken(
      @Req() request: Express.Request,
      @GetUser('rol') userRol: any,
      @RowHeaders() rowHeaders: string[]
    ) {
      return userRol
  
  }
}
