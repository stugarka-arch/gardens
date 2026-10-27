export type ApiErrorBody = { message?: string | string[] };
export type UploadedImage = {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
};
