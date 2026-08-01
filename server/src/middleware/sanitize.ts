import { Request, Response, NextFunction } from 'express'

// express-mongo-sanitize v2 crashes on Express 5 because it tries to
// reassign `req.query`, which Express 5 exposes as a getter-only property.
// This is a minimal, Express-5-safe replacement that strips Mongo operator
// keys (`$gt`, `$ne`, etc.) and dotted keys from `req.body`, which is the
// only place user input reaches our Mongoose queries in this API
// (no endpoint here reads from req.query).
const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }

  if (value && typeof value === 'object') {
    const clean: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('$') || key.includes('.')) {
        continue
      }
      clean[key] = sanitizeValue(val)
    }
    return clean
  }

  return value
}

export const sanitizeBody = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body)
  }
  next()
}
