const axios = require("axios");
const Tesseract = require("tesseract.js");

const Expense = require("../models/Expense");

exports.scanInvoice = async (req, res) => {

try {


const result = await Tesseract.recognize(req.file.path, "eng");
const text = result.data.text;


const ai = await axios.post(
"https://api.groq.com/openai/v1/chat/completions",
{
model: "llama-3.1-8b-instant",
messages: [
{
role: "user",
content: `
Return STRICT JSON only.

Rules:
- Use double quotes for ALL keys and values
- Do NOT include any explanation
- Do NOT include markdown
- Do NOT include trailing commas
- JSON must be parseable by JSON.parse()

Format:
{
  "vendor": "...",
  "items": [
    { "name": "...", "quantity": 1, "price": 100 }
  ],
  "total": 100,
  "category": "...",
  "insight": "...",
  "recommendation": "..."
}

Invoice text:
${text}
`
}
]
},
{
headers: {
Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
"Content-Type": "application/json"
}
}
);


let aiText = ai.data.choices[0].message.content.trim();


aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();



const start = aiText.indexOf("{");
const end = aiText.lastIndexOf("}") + 1;

const jsonString = aiText.substring(start, end);



let parsed;

try {
  parsed = JSON.parse(jsonString);
} catch (err) {
  console.log("RAW AI OUTPUT:", aiText);

  const fixed = jsonString
    .replace(/(\w+):/g, '"$1":') 
    .replace(/'/g, '"'); 

  try {
    parsed = JSON.parse(fixed);
  } catch (e) {
    return res.status(500).json({
      message: "AI returned invalid JSON",
      raw: aiText
    });
  }
}



const expense = new Expense({
userId: req.userId,
vendor: parsed.vendor || "Unknown",
items: parsed.items || [],
total: parsed.total || 0,


category: parsed.category || "Other",
insight: parsed.insight || "",
recommendation: parsed.recommendation || "",

invoiceImage: req.file.path,
date: new Date()
});


await expense.save();



res.json(expense);

} catch (err) {

console.error("Scan Error:", err);

res.status(500).json({
message: "Invoice processing failed"
});

}

};


exports.getDashboard = async (req, res) => {

try {

const expenses = await Expense.find({ userId: req.userId });

res.json(expenses);

} catch (err) {

res.status(500).json(err);

}

};



exports.getTotalExpenses = async (req, res) => {

try {

const expenses = await Expense.find({ userId: req.userId });

const total = expenses.reduce((sum, e) => sum + e.total, 0);

res.json({ total });

} catch (err) {

res.status(500).json(err);

}

};



const mongoose = require("mongoose");

exports.getMonthlyExpenses = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const result = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          safeDate: {
            $toDate: "$date" // ✅ FORCE conversion
          }
        }
      },
      {
        $group: {
          _id: { $month: "$safeDate" }, // ✅ USE safeDate
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(result);

  } catch (err) {
    console.error("🔥 MONTHLY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};




exports.getVendorStats = async (req, res) => {

try {

const result = await Expense.aggregate([
{ $match: { userId: req.userId } },
{
$group: {
_id: "$vendor",
total: { $sum: "$total" }
}
},
{ $sort: { total: -1 } }
]);

res.json(result);

} catch (err) {

res.status(500).json(err);

}

};



exports.getSingleExpense = async (req, res) => {

try {

const expense = await Expense.findOne({
_id: req.params.id,
userId: req.userId
});

if (!expense) {
return res.status(404).json({ message: "Expense not found" });
}

res.json(expense);

} catch (err) {

res.status(500).json(err);

}

};



exports.updateExpense = async (req, res) => {

try {

const updated = await Expense.findOneAndUpdate(
{
_id: req.params.id,
userId: req.userId
},
req.body,
{ new: true }
);

if (!updated) {
return res.status(404).json({ message: "Expense not found" });
}

res.json(updated);

} catch (err) {

res.status(500).json(err);

}

};




exports.deleteExpense = async (req, res) => {

try {

const deleted = await Expense.findOneAndDelete({
_id: req.params.id,
userId: req.userId
});

if (!deleted) {
return res.status(404).json({ message: "Expense not found" });
}

res.json({ message: "Expense deleted successfully" });

} catch (err) {

res.status(500).json(err);

}

};

const Invoice = require("../models/Invoice");

// GET ALL
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.userId });
    res.json(invoices);
  } catch (err) {
    res.status(500).json(err);
  }
};

// CREATE
exports.createInvoice = async (req, res) => {
  try {
    const count = await Invoice.countDocuments();

    const invoice = new Invoice({
      ...req.body,
      userId: req.userId,
      invoiceNumber: `INV-${1000 + count}`,
    });

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE
exports.updateInvoice = async (req, res) => {
  try {
    const updated = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
};

// DELETE
exports.deleteInvoice = async (req, res) => {
  try {
    await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};