export interface IResponse {
  success: true | false;
  message: string;
  data: any;
  error_code?: number;
  token?: string;
}
