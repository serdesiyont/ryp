import { NextResponse } from "next/server";

/**
 * Domain errors that mirror the HTTP semantics the old NestJS backend used.
 * Services throw these; route handlers translate them into the exact JSON
 * response shapes the frontend already expects.
 */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad request") {
    super(400, message);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Serialize a Mongoose document/lean result to a plain JSON-safe object,
 * matching the wire format Express produced (ObjectId -> string, Date -> ISO).
 */
export function toJSON<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(toJSON(data), { status });
}

/**
 * Map a thrown error to the JSON response shape the frontend expects.
 * Domain HttpErrors (400/401/404) return `{ message }`; anything else becomes a
 * 500 with `{ message: fallbackMessage, error }`, mirroring the old NestJS
 * controllers' catch blocks.
 */
export function handleError(error: unknown, fallbackMessage: string) {
  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  return NextResponse.json(
    { message: fallbackMessage, error: errorMessage(error) },
    { status: 500 }
  );
}
