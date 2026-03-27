require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use((req,res,next)=>{
console.log(req.method,req.url);
next();
});

connectDB();

app.get("/", (req, res) => {
res.send("Invoice OCR API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/invoice", invoiceRoutes);

app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});