export interface UploadPayload {
  fileName: string;
  target: string;
}

export const fileUploadService = {
  async createPlaceholderUpload(payload: UploadPayload) {
    return {
      fileName: payload.fileName,
      target: payload.target,
      status: "pending",
      uploadUrl: ""
    };
  }
};
