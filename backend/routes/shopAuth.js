const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

/* =========================
   SHOP REGISTER
========================= */
router.post("/register", async (req, res) => {
  const { shop_name, email, password } = req.body;

  if (!shop_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM shops WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO shops (shop_name, email, password) VALUES (?, ?, ?)",
      [shop_name, email, hashedPassword]
    );

    res.status(201).json({ message: "Shop registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   SHOP LOGIN
========================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [shops] = await db.query(
      "SELECT * FROM shops WHERE email = ?",
      [email]
    );

    if (shops.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const shop = shops[0];
    const isMatch = await bcrypt.compare(password, shop.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: shop.id, type: "shop" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      shop: {
        id: shop.id,
        shop_name: shop.shop_name,
        email: shop.email,
        type: "shop"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
