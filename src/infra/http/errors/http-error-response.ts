export interface HttpErrorResponse {
  statusCode: number
  body: {
    message: string
    issues?: Record<string, string[]>
  }
}
