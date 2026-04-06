export interface CloudinaryUploadPayload {
  fileName: string;
  resourceType: "image" | "raw" | "auto";
  folder: string;
}

export function getCloudinaryConfig() {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "demo-cloud",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "demo-key"
  };
}

export function buildSignedUploadDescriptor(payload: CloudinaryUploadPayload) {
  return {
    ...payload,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "unsigned-demo",
    timestamp: Date.now()
  };
}
