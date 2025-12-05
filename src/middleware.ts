import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Middleware is now just a passthrough
    // Device detection is handled client-side for better resolution-based switching
    return NextResponse.next();
}

export const config = {
    matcher: [],
};
