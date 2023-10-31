const connection = require('./db');
const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy;

// Helper function to compare passwords
const comparePasswords = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Helper function to find the user in the database
const findUser = async (username, password) => {
  const accountTypes = ['student', 'faculty', 'admin'];

  for (const type of accountTypes) {
    const query = `SELECT TUPCID, PASSWORD FROM ${type}_accounts WHERE TUPCID = ?`;
    const result = await connection.query(query, [username]);
    if (result.length > 0) {
      const user = result[0];
      const isMatch = await comparePasswords(password, user.PASSWORD);
      if (isMatch) {
        return { accountType: type, table: `${type}_accounts` };
      }
    }
  }

  return null;
};

module.exports = function (passport) {
  // Local Strategy for all account types (student, faculty, admin)
  passport.use(
    'local',
    new localStrategy(
      {
        usernameField: 'TUPCID',
        passwordField: 'PASSWORD',
      },
      async (username, password, done) => {
        try {
          const user = await findUser(username, password);
          if (user) {
            const { accountType, table } = user;
            const query = `SELECT TUPCID, SURNAME, FIRSTNAME, GSFEACC, COURSE, YEAR, STATUS FROM ${table} WHERE TUPCID = ?`;
            const result = await connection.query(query, [username]);
            if (result.length === 0) {
              return done(new Error('Failed to deserialize user'));
            }
            const userData = {
              accountType,
              TUPCID: result[0].TUPCID,
              SURNAME: result[0].SURNAME,
              FIRSTNAME: result[0].FIRSTNAME,
              GSFEACC: result[0].GSFEACC,
              COURSE: result[0].COURSE,
              YEAR: result[0].YEAR,
              STATUS: result[0].STATUS,
            };
            return done(null, userData);
          } else {
            return done(null, false);
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, { accountType: user.accountType, TUPCID: user.TUPCID });
  });

  passport.deserializeUser((userData, done) => {
    const { accountType, TUPCID } = userData;

    const query = `SELECT TUPCID, SURNAME, FIRSTNAME, GSFEACC, COURSE, YEAR, STATUS FROM ${accountType}_accounts WHERE TUPCID = ?`;
    connection.query(query, [TUPCID], (err, result) => {
      if (err) {
        return done(err);
      }
      if (!result || result.length === 0) {
        return done(new Error('Failed to deserialize user'));
      }
      const user = {
        accountType,
        TUPCID: result[0].TUPCID,
        SURNAME: result[0].SURNAME,
        FIRSTNAME: result[0].FIRSTNAME,
        GSFEACC: result[0].GSFEACC,
        COURSE: result[0].COURSE,
        YEAR: result[0].YEAR,
        STATUS: result[0].STATUS,
      };
      done(null, user);
    });
  });
};