import session from "express-session";
import pgSession from "connect-pg-simple";

const PgSession = pgSession(session);

export const sessionConfig = session({
    store: new PgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_KEY || "LZFB",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 2
    }
})