const express = require("express");
const db = require("../config/db");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

/* =========================
   CREATE PRODUCT (ADVANCED)
========================= */
router.post(
  "/",
  auth,
  upload.fields([
    { name: "main_image", maxCount: 1 },
    { name: "gallery", maxCount: 5 }
  ]),
  async (req, res) => {
    const {
      name,
      price,
      description,
      category,
      stock,
      sku,
      discount_price,
      brand,
      status
    } = req.body;

    if (req.user.type !== "shop" && req.user.type !== "staff") {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price required" });
    }

    const shopId =
      req.user.type === "shop" ? req.user.id : req.user.shop_id;

    const mainImage =
  req.files?.main_image?.[0]?.filename || null;

    try {
      const [result] = await db.query(
        `INSERT INTO products
        (shop_id, name, price, description, category, stock, sku, discount, brand, status, main_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          shopId,
          name,
          price,
          description || null,
          category || null,
          stock || 0,
          sku || null,
          discount_price || null,
          brand || null,
          status || "active",
          mainImage
        ]
      );

      const productId = result.insertId;

      // Save gallery images
      if (req.files.gallery) {
        for (const img of req.files.gallery) {
          await db.query(
            `INSERT INTO product_images (product_id, image_path)
             VALUES (?, ?)`,
            [productId, img.filename]
          );
        }
      }

      res.status(201).json({ message: "Product created successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

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
router.put('/:id', auth, upload.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), async (req, res) => {
  const productId = req.params.id;

  if (req.user.type !== 'shop' && req.user.type !== 'staff') {
    return res.status(403).json({ message: 'Not allowed' });
  }

  const shopId = req.user.type === 'shop' ? req.user.id : req.user.shop_id;

  try {
    // Fetch existing product
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ? AND shop_id = ?',
      [productId, shopId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const p = products[0];

    // Prepare updated data (keep old values if not provided)
    const {
      name,
      description,
      price,
      discount,  // make sure column name matches DB
      stock,
      category,
      brand,
      sku,
      status
    } = req.body;

    // Handle main image
    const main_image = req.files['main_image'] 
      ? req.files['main_image'][0].filename 
      : p.main_image;

    // Update product fields (without gallery)
    await db.query(
      `UPDATE products 
       SET name=?, description=?, price=?, discount=?, stock=?, category=?, brand=?, sku=?, status=?, main_image=? 
       WHERE id=?`,
      [
        name || p.name,
        description || p.description,
        price || p.price,
        discount || p.discount || 0, // use discount_price
        stock || p.stock,
        category || p.category,
        brand || p.brand,
        sku || p.sku,
        status || p.status,
        main_image,
        productId
      ]
    );

    // Handle gallery images separately
    if (req.files['gallery']) {
      // Remove old gallery images for this product
      await db.query("DELETE FROM product_images WHERE product_id = ?", [productId]);

      // Insert new gallery images
      for (const file of req.files['gallery']) {
        await db.query(
          "INSERT INTO product_images (product_id, image_path) VALUES (?, ?)",
          [productId, file.filename]
        );
      }
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
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

/* =========================
   GET SINGLE PRODUCT (WITH IMAGES)
========================= */
router.get("/:id/details", async (req, res) => {
  const productId = req.params.id;

  try {
    const [[product]] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [images] = await db.query(
      "SELECT image_path FROM product_images WHERE product_id = ?",
      [productId]
    );

    res.json({
      ...product,
      gallery: images.map(img => img.image_path)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
