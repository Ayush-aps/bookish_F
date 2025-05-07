/**
 * Passport configuration for local authentication strategy
 */

const LocalStrategy = require("passport-local").Strategy
const User = require("../models/User")

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        // Match user
        const user = await User.findOne({ email }).select("+password") 

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Match password
        const isMatch = await user.matchPassword(password)

        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Return user without password
        const userWithoutPassword = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
        }

        return done(null, userWithoutPassword);
      } catch (err) {
        return done(err);
      }
    })
  )

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (err) {
      done(err)
    }
  })
}

