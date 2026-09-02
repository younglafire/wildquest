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
