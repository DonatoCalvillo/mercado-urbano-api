import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Response } from 'express';

import { AuthService } from './auth.service';

import { ChangePasswordDto, CreateUsuarioDto, LoginUsuarioDto } from './dto';

import { GetUser, Auth, ValidRoles } from './decorators';
import { Usuario } from './entities';

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

  @Put('changePassword')
  @Auth()
  changePassword(
    @GetUser() user: Usuario,
    @Res() res: Response,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, res, changePasswordDto);
  }

  @Post('/masiveRegister')
  @UseInterceptors(FileInterceptor('file'))
  @Auth(ValidRoles.admin, ValidRoles.superAdmin)
  masiveRegister(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 100 * 4 }),
          new FileTypeValidator({
            fileType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.authService.masiveRegister(file);
  }
}
