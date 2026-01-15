const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { auth } = require("../middleware/auth");

const router = express.Router();

/* =========================
   CREATE STAFF (SHOP ONLY)
========================= */
router.post("/create", auth, async (req, res) => {
  // Only shop owners can create staff
  if (req.user.type !== "shop") {
    return res.status(403).json({ message: "Only shops can create staff" });
  }

  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    // check if email already exists
    const [existing] = await db.query(
      "SELECT id FROM shop_staff WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO shop_staff (shop_id, name, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, name, email, hashed, role || "staff"]
    );

    res.status(201).json({ message: "Staff created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   STAFF LOGIN
========================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [staffs] = await db.query(
      "SELECT * FROM shop_staff WHERE email = ?",
      [email]
    );

    if (staffs.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const staff = staffs[0];
    const isMatch = await bcrypt.compare(password, staff.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: staff.id,
        type: "staff",
        shop_id: staff.shop_id,
        role: staff.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      staff: {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        shop_id: staff.shop_id,
        type: "staff"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   LIST STAFF (SHOP ONLY)
========================= */
router.get("/my", auth, async (req, res) => {
  if (req.user.type !== "shop" && req.user.type !== "staff") {
    return res.status(403).json({ message: "Not allowed" });
  }

  const shopId = req.user.type === "shop" ? req.user.id : req.user.shop_id;

  try {
    const [staffs] = await db.query(
      "SELECT id, name, email, role FROM shop_staff WHERE shop_id = ?",
      [shopId]
    );
    res.json(staffs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE STAFF
========================= */
router.delete("/:id", auth, async (req, res) => {
  const staffId = req.params.id;

  // Only shop owner or admin staff can delete
  if (req.user.type === "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admin can delete staff" });
  }

  const shopId = req.user.type === "shop" ? req.user.id : req.user.shop_id;

  try {
    const [staff] = await db.query(
      "SELECT * FROM shop_staff WHERE id = ? AND shop_id = ?",
      [staffId, shopId]
    );

    if (staff.length === 0) {
      return res.status(404).json({ message: "Staff not found" });
    }

    await db.query("DELETE FROM shop_staff WHERE id = ?", [staffId]);
    res.json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
