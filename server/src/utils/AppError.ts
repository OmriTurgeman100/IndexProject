class AppError extends Error {
  statusCode: number;
  status: string;
  operational: boolean;

  constructor(message: any, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.operational = true;
  }
}

export default AppError;
