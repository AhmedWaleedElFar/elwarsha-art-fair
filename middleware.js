import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Only apply to the home route
  if (pathname === '/') {
    // Check if the user is authenticated
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // If user is authenticated, redirect based on role
    if (token) {
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (token.role === 'judge' && Array.isArray(token.categories) && token.categories.length > 0) {
        return NextResponse.redirect(new URL('/vote', request.url));
      }
    }
    
    // If not authenticated or doesn't match specific roles, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // For all other routes, continue normally
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Apply to homepage only
    '/',
  ],
};
