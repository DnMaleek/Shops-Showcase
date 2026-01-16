const express = require("express");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { auth, shopAccess, adminOnly } = require('../middleware/auth')

const router = express.Router();

/* =========================
   GET SHOP SETTINGS
========================= */
router.get("/", auth, shopAccess, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT shop_name, description, email, phone, logo FROM shops WHERE id = ?",
      [req.user.id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE SHOP SETTINGS
========================= */
router.put("/", auth, shopAccess, async (req, res) => {
  const { shop_name, description, email, phone, logo } = req.body;
  try {
    await db.query(
      `UPDATE shops
       SET shop_name=?, description=?, email=?, phone=?, logo=?
       WHERE id=?`,
      [shop_name, description, email, phone, logo, req.user.id]
    );

    res.json({ message: "Settings updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
