import { ApiError, baseUrl } from "./apiClient";
import type { UploadedImage } from "../types/api";
export const fileService = {
  uploadImage: (file: File, onProgress?: (percent: number) => void) =>
    new Promise<UploadedImage>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${baseUrl}/files/upload`);
      xhr.withCredentials = true;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable)
          onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onerror = () =>
        reject(new ApiError("Не вдалося з’єднатися з сервером.", 0));
      xhr.onload = () => {
        let payload: unknown = null;
        try {
          payload = JSON.parse(xhr.responseText) as unknown;
        } catch {
          /* status handling below */
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(payload as UploadedImage);
          return;
        }
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "message" in payload
            ? String(payload.message)
            : "Не вдалося завантажити зображення.";
        reject(new ApiError(message, xhr.status));
      };
      const formData = new FormData();
      formData.append("file", file);
      xhr.send(formData);
    }),
};
