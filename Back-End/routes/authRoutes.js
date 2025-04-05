import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();

router.post("/signUp", async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length > 0) return res.status(400).json({ error: "User already exists" });

  const hash = await bcrypt.hash(password, 10);
  const newUser = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [email, hash]);

  req.login(newUser.rows[0], err => {
    if (err) return res.status(500).json({ error: "Login failed" });
    res.status(200).json({ message: "Registered and logged in", user: newUser.rows[0] });
  });
});

router.post("/SingIn", async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, result.rows[0].password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });

  res.status(200).json({ message: "Login successful", user: result.rows[0] });
});

// Google OAuth
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/secrets", passport.authenticate("google", {
  failureRedirect: "/auth/google/failure",
}), (req, res) => {
  res.redirect("/Explore.html");
});
router.get("/auth/google/failure", (req, res) => {
  res.redirect("/");
});

// Contact
router.post("/contactForQuery", async (req, res) => {
  const sent = await sendEmail(req.body);
  sent ? res.status(200).json({ message: "Email sent!" }) : res.status(500).json({ error: "Failed" });
});

export default router;
