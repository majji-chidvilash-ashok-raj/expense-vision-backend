const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getInventory,
  addItem,
  updateItem,
  deleteItem
} = require("../controllers/inventoryController");

router.get("/", auth, getInventory);
router.post("/", auth, addItem);
router.put("/:id", auth, updateItem);
router.delete("/:id", auth, deleteItem);

module.exports = router;