import { IsString } from "class-validator";
import { IsEmail, IsPhoneNumber, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUsuarioDto {

  @IsString({ message: "El nombre debe ser una cadena de caracteres." })
  @MinLength(1, { message: "El nombre debe tener al menos un caracter." })
  nombre: string;
  
  @IsString({ message: "El apellido paterno debe ser una cadena de caracteres." })
  @MinLength(1, { message: "El apellido paterno debe tener al menos un caracter." })
  apellido_paterno: string;
  
  @IsString({ message: "El apellido materno debe ser una cadena de caracteres." })
  @MinLength(1, { message: "El apellido materno debe tener al menos un caracter. "})
  apellido_materno: string;
  
  @IsString({ message: "La contraseña debe ser una cadena de caracteres." })
  @MinLength(6, { message: "La contraseña debe ser de al menos 6 caracteres." })
  @MaxLength(50, { message: "La contraseña debe ser de maximo 50 caracteres." })
  @Matches(
      /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message: 'La contraseña debe ser de al menos 6 caracteres, tener una mayuscula, una minuscula y un numero'
  })
  contrasenia: string;
  
  @IsString({ message: "El correo debe ser una cadena de caracteres." })
  @IsEmail()
  correo: string;

  @IsString({ message: "El numero de telefono debe ser una cadena de caracteres." })
  @IsPhoneNumber('MX', {message: "El numero de telefono debe ser un numero de telefono valido."})
  telefono: string;

  @IsString()
  @MinLength(1)
  fk_area: string;
  
}