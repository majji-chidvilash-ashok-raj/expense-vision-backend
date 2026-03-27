const express = require("express");
const router = express.Router();

const multer = require("multer");

const auth = require("../middleware/authMiddleware");

const {
scanInvoice,
getDashboard,
getTotalExpenses,
getMonthlyExpenses,
getVendorStats,
getSingleExpense,
updateExpense,
deleteExpense
} = require("../controllers/invoiceController");


// Multer Storage Configuration
const storage = multer.diskStorage({
destination: function(req, file, cb) {
cb(null, "uploads/");
},
filename: function(req, file, cb) {
const uniqueName = Date.now() + "-" + file.originalname;
cb(null, uniqueName);
}
});


// Allow Only Image Files
const fileFilter = (req, file, cb) => {

if (file.mimetype.startsWith("image")) {
cb(null, true);
} else {
cb(new Error("Only image files are allowed"), false);
}

};


// Multer Upload Middleware
const upload = multer({
storage: storage,
fileFilter: fileFilter,
limits: {
fileSize: 5 * 1024 * 1024
}
});


// Upload and Scan Invoice
router.post(
"/scan",
auth,
upload.single("invoice"),
scanInvoice
);


// Dashboard Data
router.get(
"/dashboard",
auth,
getDashboard
);


// Total Expenses
router.get(
"/total",
auth,
getTotalExpenses
);


// Monthly Expenses
router.get(
"/monthly",
auth,
getMonthlyExpenses
);


// Vendor Statistics
router.get(
"/vendors",
auth,
getVendorStats
);


// Get Single Expense
router.get(
"/:id",
auth,
getSingleExpense
);


// Update Expense
router.put(
"/:id",
auth,
updateExpense
);


// Delete Expense
router.delete(
"/:id",
auth,
deleteExpense
);


module.exports = router;