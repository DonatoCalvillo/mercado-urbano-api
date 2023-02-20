import { IsString, MinLength } from "class-validator";

export class SetLugarDto {

  @IsString()
  @MinLength(1)
  fk_lugar: string;

}