const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { getPrismaClient } = require('../utils/prisma');

const prisma = getPrismaClient();

// Use PORT from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Debug: Log the callback URL being used
// Use environment variable for callback URL, with fallback
const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
  (process.env.NODE_ENV === 'production' 
    ? "https://qb-securiegnty-backend.onrender.com/api/auth/google/callback"
    : `http://localhost:${PORT}/api/auth/google/callback`);

console.log('🔐 Google OAuth Configuration:');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Port:', PORT);
console.log('   Callback URL:', callbackURL);
console.log('   Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set ✅' : 'Missing ❌');
console.log('   Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set ✅' : 'Missing ❌');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: callbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔐 Google OAuth Profile:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });

    // Check if user already exists with this Google ID
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (user) {
      console.log('✅ Existing Google user found:', user.email);
      // Update last login
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
      return done(null, user);
    }

    // Check if user exists with same email
    const emailUser = await prisma.user.findUnique({
      where: { email: profile.emails?.[0]?.value }
    });

    if (emailUser) {
      console.log('🔗 Linking Google account to existing email user');
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: emailUser.id },
        data: { 
          googleId: profile.id,
          isEmailVerified: true,
          lastLoginAt: new Date()
        }
      });
      return done(null, user);
    }

    // Create new user
    console.log('👤 Creating new Google user');
    user = await prisma.user.create({
      data: {
        email: profile.emails?.[0]?.value,
        googleId: profile.id,
        firstName: profile.name?.givenName || profile.displayName,
        lastName: profile.name?.familyName || '',
        isEmailVerified: true,
        lastLoginAt: new Date()
      }
    });

    console.log('✅ New Google user created:', user.email);
    return done(null, user);

  } catch (error) {
    console.error('❌ Google OAuth Error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        googleId: true,
        isEmailVerified: true,
        lastLoginAt: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
