import { IsString, MinLength } from "class-validator";

export class ExcelListDto {

  @IsString()
  @MinLength(1)
  fk_evento: string;

}