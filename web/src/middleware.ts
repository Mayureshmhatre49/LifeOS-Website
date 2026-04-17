import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/signup', '/api/auth', '/api/health', '/_next', '/favicon.ico', '/og.png', '/robots.txt', '/sitemap.xml']

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'))
}

export default auth(async function middleware(req: NextRequest & { auth: unknown }) {
  const { pathname } = req.nextUrl
  const session = (req as { auth?: { user?: { id?: string } } }).auth

  if (pathname.startsWith('/api/chat')) {
    const origin = req.headers.get('origin')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    if (origin && !origin.startsWith(appUrl) && process.env.NODE_ENV === 'production') {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  if (!isPublic(pathname) && !session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
