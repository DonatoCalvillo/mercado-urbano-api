import { Usuario } from "../entities";

export interface IResponseLogin{
  message: string;
  user: Usuario;
  token?: string;
}