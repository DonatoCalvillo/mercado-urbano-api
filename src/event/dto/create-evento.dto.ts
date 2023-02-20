import { IsDate, IsString, MinLength } from "class-validator";

export class CreateEventoDto {
  @IsString({
    message: "El nombre debe ser una cadena de caracteres."
  })
  @MinLength(1,{
    message: "El nombre debe tener al menos un caracter."
  })
  nombre: string;

  @IsString()
  @MinLength(1)
  fechaInicio: string;

  @IsString()
  @MinLength(1)
  fechaFin: string;

  @IsString()
  @MinLength(1)
  fechaInscripcion: string;

  @IsString()
  @MinLength(1)
  plaza: string;

  @IsString()
  @MinLength(1)
  hora: string;
}