const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

vendor:{
type:String,
required:true
},

invoiceImage:{
type:String,
required:true
},

items:[
{
name:{
type:String,
required:true
},
quantity:{
type:Number,
required:true
},
price:{
type:Number,
required:true
}
}
],

total:{
type:Number,
required:true
},
category: {
  type: String,
  default: "General"
},

insight: {
  type: String,
  default: ""
},

recommendation: {
  type: String,
  default: ""
},

date:{
type:Date,
default:Date.now
}

},{timestamps:true});

module.exports = mongoose.model("Expense",ExpenseSchema);