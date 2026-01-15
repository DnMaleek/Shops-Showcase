const express = require("express");
const db = require("../config/db");
const { auth } = require("../middleware/auth");

const router = express.Router();

/* =========================
   CREATE PRODUCT
========================= */
router.post("/", auth, async (req, res) => {
  const { name, description, price } = req.body;

  if (req.user.type !== "shop" && req.user.type !== "staff") {
    return res.status(403).json({ message: "Not allowed" });
  }

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price required" });
  }

  const shopId =
    req.user.type === "shop" ? req.user.id : req.user.shop_id;

  try {
    await db.query(
      `INSERT INTO products (shop_id, name, price, description)
       VALUES (?, ?, ?, ?)`,
      [shopId, name, price, description]
    );

    res.status(201).json({ message: "Product created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET ALL PRODUCTS (PUBLIC)
========================= */
router.get("/", async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT products.*, shops.shop_name
       FROM products
       JOIN shops ON products.shop_id = shops.id
       ORDER BY products.created_at DESC`
    );

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET MY SHOP PRODUCTS
========================= */
router.get("/my", auth, async (req, res) => {
  if (req.user.type !== "shop" && req.user.type !== "staff") {
    return res.status(403).json({ message: "Not allowed" });
  }

  const shopId =
    req.user.type === "shop" ? req.user.id : req.user.shop_id;

  try {
    const [products] = await db.query(
      "SELECT * FROM products WHERE shop_id = ?",
      [shopId]
    );

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   UPDATE PRODUCT
========================= */
router.put("/:id", auth, async (req, res) => {
  const { name, price, description } = req.body;
  const productId = req.params.id;

  if (req.user.type !== "shop" && req.user.type !== "staff") {
    return res.status(403).json({ message: "Not allowed" });
  }

  const shopId =
    req.user.type === "shop" ? req.user.id : req.user.shop_id;

  try {
    const [product] = await db.query(
      "SELECT * FROM products WHERE id = ? AND shop_id = ?",
      [productId, shopId]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await db.query(
      `UPDATE products SET name=?, price=?, description=? WHERE id=?`,
      [name, price, description, productId]
    );

    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   DELETE PRODUCT
========================= */
router.delete("/:id", auth, async (req, res) => {
  const productId = req.params.id;

  if (req.user.type !== "shop" && req.user.type !== "staff") {
    return res.status(403).json({ message: "Not allowed" });
  }

  const shopId =
    req.user.type === "shop" ? req.user.id : req.user.shop_id;

  try {
    const [product] = await db.query(
      "SELECT * FROM products WHERE id = ? AND shop_id = ?",
      [productId, shopId]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await db.query(
      "DELETE FROM products WHERE id = ?",
      [productId]
    );

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
