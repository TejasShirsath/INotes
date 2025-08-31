class CaptureError extends Error {
  public message: string;
  public statusCode: number;

  constructor(message: string, error?: number) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = error || 500;
  }
}

export default CaptureError;
