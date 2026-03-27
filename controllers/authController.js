const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.signup = async(req,res)=>{

try{

const {businessName,email,password} = req.body;

const existingUser = await User.findOne({email});

if(existingUser){
return res.status(400).json({msg:"User already exists"});
}

const hashedPassword = await bcrypt.hash(password,10);

const user = new User({
businessName,
email,
password:hashedPassword
});

await user.save();

const token = jwt.sign(
{userId:user._id},
process.env.JWT_SECRET,
{expiresIn:"7d"}
);

res.json({token});

}catch(err){
res.status(500).json({msg:"Signup failed"});
}

};

exports.login = async(req,res)=>{

try{

const {email,password} = req.body;

const user = await User.findOne({email});

if(!user){
return res.status(400).json({msg:"User not found"});
}

const valid = await bcrypt.compare(password,user.password);

if(!valid){
return res.status(400).json({msg:"Wrong password"});
}

const token = jwt.sign(
{userId:user._id},
process.env.JWT_SECRET,
{expiresIn:"7d"}
);

res.json({
token,
user:{
id:user._id,
email:user.email,
businessName:user.businessName
}
});

}catch(err){
res.status(500).json({msg:"Login failed"});
}

};