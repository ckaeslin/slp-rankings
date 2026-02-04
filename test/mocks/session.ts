import { NextRequest } from 'next/server'

interface SessionData {
  userId: string
  email: string
  role: 'super_admin' | 'admin'
  clubId: string | null
  token: string
  exp: number
}

export function createMockSession(overrides: Partial<SessionData> = {}): string {
  const session: SessionData = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'super_admin',
    clubId: null,
    token: 'test-token',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    ...overrides,
  }

  return Buffer.from(JSON.stringify(session)).toString('base64')
}

export function createMockRequest(options: {
  method?: string
  body?: unknown
  session?: Partial<SessionData> | null
  url?: string
}): NextRequest {
  const url = options.url || 'http://localhost:3000/api/test'
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')

  const cookieValue = options.session !== null
    ? createMockSession(options.session || {})
    : null

  const request = new NextRequest(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  // Override cookies.get to return our mock session
  const originalCookiesGet = request.cookies.get.bind(request.cookies)
  request.cookies.get = (name: string) => {
    if (name === 'admin-session' && cookieValue) {
      return { name: 'admin-session', value: cookieValue }
    }
    return originalCookiesGet(name)
  }

  return request
}

export function createSuperAdminRequest(options: Omit<Parameters<typeof createMockRequest>[0], 'session'> = {}) {
  return createMockRequest({
    ...options,
    session: { role: 'super_admin' },
  })
}

export function createClubAdminRequest(clubId: string, options: Omit<Parameters<typeof createMockRequest>[0], 'session'> = {}) {
  return createMockRequest({
    ...options,
    session: { role: 'admin', clubId },
  })
}

export function createUnauthenticatedRequest(options: Omit<Parameters<typeof createMockRequest>[0], 'session'> = {}) {
  return createMockRequest({
    ...options,
    session: null,
  })
}
