export class InvalidImageError extends Error {
  constructor() {
    super("The uploaded file could not be decoded as an image.");
    this.name = "InvalidImageError";
  }
}

export class ModelUnavailableError extends Error {
  constructor(options?: ErrorOptions) {
    super("The image classifier could not be initialized.", options);
    this.name = "ModelUnavailableError";
  }
}

export class InvalidCatalogueMetadataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidCatalogueMetadataError";
  }
}

export class CaptureAuthorizationUnavailableError extends Error {
  constructor(options?: ErrorOptions) {
    super(
      "Capture authorization is unavailable. Configure CAPTURE_AUTHORITY_SECRET_KEY_BASE64 or provide WQ_CAPTURE_AUTHORITY_KEYPAIR_PATH (default: .wildquest-keys/capture-authority.json) using the shared Devnet capture authority keypair.",
      options,
    );
    this.name = "CaptureAuthorizationUnavailableError";
  }
}
