const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoiceController");

router.get("/", auth, getInvoices);
router.post("/", auth, createInvoice);
router.put("/:id", auth, updateInvoice);
router.delete("/:id", auth, deleteInvoice);

module.exports = router;