const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { auth } = require("../middleware/auth")

const router = express.Router();

/* =========================
   USER REGISTER
========================= */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   USER LOGIN
========================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, type: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: "user"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET USER PROFILE
========================= */
router.get("/profile", auth, async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE USER PROFILE
========================= */
router.put("/profile/update", auth, async (req, res) => {
  const { name, email, phone, address, payment_details, password } = req.body;

  try {
    // Check if email is being updated and already exists
    if (email) {
      const [existing] = await db.query("SELECT id FROM users WHERE email = ? AND id != ?", [email, req.userId]);
      if (existing.length > 0) return res.status(400).json({ message: "Email already in use" });
    }

    let fields = [];
    let values = [];

    if (name) { fields.push("name = ?"); values.push(name); }
    if (email) { fields.push("email = ?"); values.push(email); }
    if (phone) { fields.push("phone = ?"); values.push(phone); }
    if (address) { fields.push("address = ?"); values.push(address); }
    if (payment_details) { fields.push("payment_details = ?"); values.push(JSON.stringify(payment_details)); }

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hashedPassword);
    }

    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    values.push(req.userId);
    await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
