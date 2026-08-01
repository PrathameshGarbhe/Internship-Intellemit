import dotenv from 'dotenv'
dotenv.config()

import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { User } from '../modules/users/user.model'

const clientID = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const callbackURL = process.env.GOOGLE_CALLBACK_URL

// Google OAuth is optional. If it isn't configured, we skip registering the
// strategy instead of crashing the whole server — "Continue with Google"
// simply won't be available until these env vars are set.
export const isGoogleOAuthConfigured = Boolean(clientID && clientSecret && callbackURL)

if (isGoogleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID as string,
        clientSecret: clientSecret as string,
        callbackURL: callbackURL as string,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails?.[0].value })

          if (user) {
            return done(null, user)
          }

          user = await User.create({
            name: profile.displayName,
            email: profile.emails?.[0].value,
            password: `google_${profile.id}`,
            avatar: profile.photos?.[0].value,
            role: 'member',
          })

          return done(null, user)
        } catch (error) {
          return done(error as Error, undefined)
        }
      }
    )
  )
} else {
  console.warn(
    '⚠️  Google OAuth is not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL missing). "Continue with Google" will be disabled.'
  )
}

export default passport