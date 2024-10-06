import { NextResponse } from 'next/server'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export const catchAsync = (fn: Function) => {
  return async (req: Request, ...args: any[]) => {
    try {
      return await fn(req, ...args)
    } catch (error) {
      console.error('Caught async error:', error)
      return handleError(error)
    }
  }
}

export const handleError = (err: unknown) => {
  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode })
  }

  console.error('Unhandled error:', err)
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}

export const logError = (context: string, error: unknown) => {
  console.error(`Error in ${context}:`, error)
  if (error instanceof Error) {
    console.error('Stack trace:', error.stack)
  }
}
