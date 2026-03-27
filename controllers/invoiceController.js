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
You are an AI financial assistant.

Extract invoice data and ALSO analyze the expense.

Return ONLY valid JSON in this format:

{
"vendor":"store name",
"items":[{"name":"item","quantity":1,"price":100}],
"total":100,
"category":"category name",
"insight":"1 short sentence about spending behavior",
"recommendation":"1 short actionable suggestion"
}

Rules:
- category must be one of: Food, Electronics, Office, Travel, Shopping, Other
- insight must be meaningful
- recommendation must be practical

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



const parsed = JSON.parse(jsonString);



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



exports.getMonthlyExpenses = async (req, res) => {
  try {

    const userId = new mongoose.Types.ObjectId(req.userId); // ✅ FIX

    const result = await Expense.aggregate([
      {
        $match: { userId: userId } // ✅ correct match
      },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(result);

  } catch (err) {
    console.error("Monthly Error:", err);
    res.status(500).json({ message: "Failed to fetch monthly data" });
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