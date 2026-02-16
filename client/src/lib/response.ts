import { NextResponse } from 'next/server';

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status = 500) {
  return NextResponse.json({ success: false, error }, { status });
}

export function messageResponse(message: string, data?: unknown, status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}
