import { Injectable } from '@nestjs/common';
import { Response } from 'express';

export enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
  UNAUTHORIZED = 401,
  FORBIDEN = 403,
  INTERNAL_SERVER_ERROR = 500,
}

@Injectable()
export class HttpResponse {
  Ok(res: Response, message: string, data?: any, token?: string): Response {
    return res.status(HttpStatus.OK).json({
      success: true,
      message,
      data,
      token,
    });
  }

  NotFound(res: Response, message: string): Response {
    return res.status(HttpStatus.NOT_FOUND).json({
      success: false,
      message,
    });
  }

  Unauthorized(res: Response, message: string): Response {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message,
    });
  }

  Forbiden(res: Response, message: string): Response {
    return res.status(HttpStatus.FORBIDEN).json({
      success: false,
      message,
    });
  }

  Error(res: Response, message: string, data?: any): Response {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: true,
      message,
      data,
    });
  }
}
