import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'La contraseña debe ser una cadena de caracteres.' })
  @MinLength(6, { message: 'La contraseña debe ser de al menos 6 caracteres.' })
  @MaxLength(50, { message: 'La contraseña debe ser de maximo 50 caracteres.' })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe ser de al menos 6 caracteres, tener una mayuscula, una minuscula y un numero',
  })
  newPassword: string;
}
