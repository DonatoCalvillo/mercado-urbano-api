import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    
    const req = ctx.switchToHttp().getRequest()
    const user = req.user

    if( !user )
      throw new InternalServerErrorException('El usuario no existe en el token')

    return (!data)
    ? user
    : user[data]
  }
)