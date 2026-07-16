export class ResponseUtil {
  static success<T>(message: string, data?: T) {
    return {
      success: true,
      message,
      data,
    };
  }

  static paginated<T>(message: string, data: T[], meta: Record<string, unknown>) {
    return {
      success: true,
      message,
      data,
      meta,
    };
  }
}
