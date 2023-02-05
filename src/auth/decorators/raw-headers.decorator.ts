import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
export const RowHeaders = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    
    const req = ctx.switchToHttp().getRequest()
    return req.rawHeaders
    
  }
)