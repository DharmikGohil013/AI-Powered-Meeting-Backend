const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserStore = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserStore.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user from Google profile
      const user = await UserStore.findOrCreateGoogleUser(profile);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = passport;
