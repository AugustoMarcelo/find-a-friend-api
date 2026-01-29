export interface HttpErrorResponse {
  statusCode: number
  body: {
    message: string
    issues?: unknown[]
  }
}
