import { Controller, Post, Body, Get } from '@nestjs/common';
import { Query } from '@nestjs/common/decorators/http/route-params.decorator';
import { AuthService } from './auth.service';
import { CreateUsuarioDto, LoginUsuarioDto } from './dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

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

  @Get()
  getAllUsers ( @Query() paginationDto: PaginationDto) {
    return this.authService.getAllUsers(paginationDto);
  }
}
