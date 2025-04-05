import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();

// ✅ Sign Up
router.post("/signUp", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length > 0)
    return res.status(400).json({ error: "User already exists" });

  const hash = await bcrypt.hash(password, 10);
  const newUser = await db.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
    [email, hash]
  );

  req.session.user = {
    id: newUser.rows[0].id,
    email: newUser.rows[0].email,
  };

  res.status(200).json({ message: "Registered and logged in", user: req.session.user });
});

// ✅ Sign In
router.post("/SingIn", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0)
    return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, result.rows[0].password);
  if (!valid)
    return res.status(400).json({ error: "Invalid password" });

  // Store user in session
  req.session.user = {
    id: result.rows[0].id,
    email: result.rows[0].email,
  };

  res.status(200).json({ message: "Login successful", user: req.session.user });
});

// ✅ Google OAuth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    failureRedirect: "/auth/google/failure",
  }),
  (req, res) => {
    req.session.user = {
      id: req.user.id,
      email: req.user.email,
    };
    res.redirect("/dashboard");
  }
);

router.get("/auth/google/failure", (req, res) => {
  res.redirect("/");
});

// ✅ Dashboard Route
router.get("/dashboard", async (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.redirect("/login.html");
  }

  // Fetch recommended/all courses (modify query as needed)
  const result = await db.query("SELECT * FROM courses");

  res.render("Explore", {
    userId,
    courses: result.rows,
  });
});

// ✅ Contact Us Email
router.post("/contactForQuery", async (req, res) => {
  const sent = await sendEmail(req.body);
  sent
    ? res.status(200).json({ message: "Email sent!" })
    : res.status(500).json({ error: "Failed to send email" });
});

export default router;
