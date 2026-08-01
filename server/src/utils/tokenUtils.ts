import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  role: string
}

// Short-lived — this is what's sent on every request, so it should expire
// quickly. The refresh flow (frontend axiosInstance/apiFetch interceptors)
// transparently exchanges it for a new one using the httpOnly refresh cookie.
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '15m',
  })
}

// Long-lived — stored only in an httpOnly cookie, never exposed to JS.
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: '7d',
  })
}

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload
}

// Verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET as string
  ) as TokenPayload
}