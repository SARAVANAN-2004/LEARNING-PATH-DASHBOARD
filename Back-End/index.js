import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import env from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { send } from "process";
import nodemailer from 'nodemailer';  

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files correctly
app.use(express.static(path.join(__dirname, "../Front-End")));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Front-End/index.html"));
});

//contact and Query messsage starts

app.post("/contactForQuery", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  console.log("📩 New Contact Form Submission:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Subject:", subject);
  console.log("Message:", message);

  try {
    const mailSent = await sendEmail(req.body);
    if (mailSent) {
      res.status(200).json({ success: true, message: "Message received & email sent!" });
    } else {
      res.status(500).json({ error: "Failed to send email" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Function to send email
async function sendEmail({ name, email, subject, message }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {

      user: process.env.GMAIL_USER, // Store in .env
      pass: process.env.GMAIL_PASS, // Store in .env
    },
  });

  const mailOptions = {
    from: email, // User's email
    to: process.env.GMAIL_USER, // Your email
    subject: `Contact Form: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Mail sent successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}
// Authentication starts

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/auth/google/failure" }),
  (req, res) => {
    res.send("Logged in successfully!");
  }
);

// Handle login failure
app.get("/auth/google/failure", (req, res) => {
  res.sendFile(path.join(__dirname, "../Front-End/index.html"));
});


app.post("/signUp", async (req, res) => {
  console.log("Received sign-up request:", req.body); // Debugging log
  const { username, email, password } = req.body;

  try {
    console.log("Checking if user exists..."); // Debugging log
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (checkResult.rows.length > 0) {
      console.log("User already exists:", email); // Debugging log
      return res.status(400).json({ error: "User already exists" });
    }

    console.log("Inserting new user into the database..."); // Debugging log
    const result = await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, password]
    );

    const user = result.rows[0];
    console.log("User inserted successfully:", user); // Debugging log

    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Login failed after sign-up" });
      }
      console.log("User logged in successfully");
      return res.status(200).json({ message: "User registered and logged in successfully", user });
    });
  } catch (err) {
    console.error("Sign-up error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/SingIn", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Received sign-in request:", req.body); // Debugging log

    // Check if the user exists
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      // User does not exist
      return res.status(400).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Compare the password (plain-text comparison since we're not hashing)
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // If everything is correct, send a success response
    console.log("User logged in successfully:", user); // Debugging log
    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("Sign-in error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        console.log("Google Profile:", profile);

        // Correct way to extract email
        const email = profile.emails ? profile.emails[0].value : null;

        if (!email) {
          return cb(new Error("No email found in Google profile"));
        }

        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);

        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, "google"]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// Authentication ends


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
