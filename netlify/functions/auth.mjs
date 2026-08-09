import { getStore } from '@netlify/blobs'
import { promisify } from 'node:util'
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'

const scrypt = promisify(scryptCallback)
const AUTH_STORE = 'stockify-auth'
const CONFIG_KEY = 'config'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

function store() {
  return getStore(AUTH_STORE)
}

function response(body, status = 200, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
  })
}

function cookieFlags(request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `Path=/; HttpOnly; SameSite=Lax${secure}`
}

function readCookie(request, name) {
  const cookies = request.headers.get('cookie') || ''
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function sessionCookie(request, token, maxAge = SESSION_TTL_SECONDS) {
  return `stockify_session=${encodeURIComponent(token)}; Max-Age=${maxAge}; ${cookieFlags(request)}`
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, 64)
  return `${salt}:${Buffer.from(derived).toString('hex')}`
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, expectedHex] = stored.split(':')
  const actual = Buffer.from(await scrypt(password, salt, 64))
  const expected = Buffer.from(expectedHex, 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function verifyAdminCode(code) {
  const expected = String(process.env.STOCKIFY_ADMIN_CODE || '')
  const actual = String(code || '')
  if (!expected || !actual) return false
  const expectedBytes = Buffer.from(expected)
  const actualBytes = Buffer.from(actual)
  return expectedBytes.length === actualBytes.length && timingSafeEqual(expectedBytes, actualBytes)
}

async function readConfig() {
  return (await store().get(CONFIG_KEY, { type: 'json' })) || null
}

async function ensureConfig() {
  const existing = await readConfig()
  if (existing) return existing

  const initialPassword = process.env.STOCKIFY_INITIAL_PASSWORD
  if (!initialPassword || initialPassword.length < 8) {
    throw new Error('STOCKIFY_INITIAL_PASSWORD is missing or too short')
  }

  const created = {
    passwordHash: await hashPassword(initialPassword),
    securityVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await store().setJSON(CONFIG_KEY, created)
  return created
}

async function createSession(request, config) {
  const token = randomBytes(32).toString('base64url')
  await store().setJSON(`session:${token}`, {
    securityVersion: config.securityVersion,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  })
  return response({ ok: true, role: 'admin' }, 200, {
    'Set-Cookie': sessionCookie(request, token),
  })
}

async function getSession(request) {
  const token = readCookie(request, 'stockify_session')
  if (!token) return null
  const session = await store().get(`session:${token}`, { type: 'json' })
  if (!session || session.expiresAt <= Date.now()) return null
  const config = await readConfig()
  if (!config || session.securityVersion !== config.securityVersion) return null
  return { token, session, config }
}

async function requireSession(request) {
  const session = await getSession(request)
  if (!session) return response({ ok: false, error: 'Unauthorized' }, 401)
  return session
}

export default async (request, context) => {
  const action = context.params?.action || new URL(request.url).pathname.split('/').pop()

  try {
    if (request.method === 'POST' && action === 'login') {
      const body = await request.json().catch(() => ({}))
      const password = String(body.password || '')
      const config = await ensureConfig()
      if (!password || !(await verifyPassword(password, config.passwordHash))) {
        return response({ ok: false, error: 'Invalid password' }, 401)
      }
      return createSession(request, config)
    }

    if (request.method === 'GET' && action === 'session') {
      const session = await getSession(request)
      if (!session) return response({ ok: false }, 401)
      return response({ ok: true, role: 'admin' })
    }

    if (request.method === 'POST' && action === 'logout') {
      const token = readCookie(request, 'stockify_session')
      if (token) await store().delete(`session:${token}`)
      return response({ ok: true }, 200, {
        'Set-Cookie': sessionCookie(request, '', 0),
      })
    }

    if (request.method === 'POST' && action === 'verify-admin-code') {
      const authenticated = await requireSession(request)
      if (authenticated instanceof Response) return authenticated
      const body = await request.json().catch(() => ({}))
      if (!verifyAdminCode(String(body.adminCode || ''))) {
        return response({ ok: false, error: 'Administrator authorization failed' }, 403)
      }
      return response({ ok: true })
    }

    if (request.method === 'POST' && action === 'change-password') {
      const authenticated = await requireSession(request)
      if (authenticated instanceof Response) return authenticated

      const body = await request.json().catch(() => ({}))
      const adminCode = String(body.adminCode || '')
      const newPassword = String(body.newPassword || '')
      const confirmation = String(body.confirmation || '')

      if (!verifyAdminCode(adminCode)) {
        return response({ ok: false, error: 'Administrator authorization failed' }, 403)
      }
      if (newPassword.length < 8) {
        return response({ ok: false, error: 'New password must be at least 8 characters' }, 400)
      }
      if (newPassword !== confirmation) {
        return response({ ok: false, error: 'New passwords do not match' }, 400)
      }

      const updated = {
        ...authenticated.config,
        passwordHash: await hashPassword(newPassword),
        securityVersion: authenticated.config.securityVersion + 1,
        updatedAt: new Date().toISOString(),
      }
      await store().setJSON(CONFIG_KEY, updated)
      return response({ ok: true, message: 'Password changed. Please log in again.' }, 200, {
        'Set-Cookie': sessionCookie(request, '', 0),
      })
    }

    return response({ ok: false, error: 'Not found' }, 404)
  } catch (error) {
    console.error('Stockify auth function error:', error)
    return response({ ok: false, error: 'Authentication service is not configured' }, 500)
  }
}

export const config = {
  path: '/api/auth/:action',
}
