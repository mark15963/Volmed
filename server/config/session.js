const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { db } = require("./db-connection");

const sessionConfig = session({
  name: "volmed.sid",
  store: new pgSession({
    pool: db,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
  proxy: true,
  unset: "destroy",
});

module.exports = sessionConfig;
