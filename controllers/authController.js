const bcrypt = require("bcrypt");
const crypto = require("crypto") ;
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const userModel = require("../models/userModel");
const sendEmail = require("../util/email") ;
const appError = require("../util/Error");


const createPasswordToken = (id) => {
  const resetToken = crypto.randomBytes(32).toString("hex") ;
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex') ;
  console.log("resetToken : " , resetToken) ;
  console.log("hashedToken :   " , hashedToken) ;
  userModel.createPasswordResetToken(id , hashedToken) ;
  return resetToken ;
};


exports.signup = async (req, res, next) => {
  const email = req.body.email;
  const pwd = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  // passwords match :
  if (pwd !== confirmPassword) {
    const err = new Error("passwords do not match");
    err.statusCode = 401;
    throw err;
  }
  // email already exists :
  const user = await userModel.findByEmail(email);
  if (user.length !== 0) {
    const err = new Error("email taken");
    err.statusCode = 401;
    throw err;
  }
  bcrypt
    .hash(pwd, 12)
    .then((hash) => {
      return userModel.createUser(email, hash);
    })
    .then((r) => {
      return res.status(201).json({
        status: "success",
        message: "user created successfully",
      });
    })
    .catch((e) => {
      next(e);
    });
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const pwd = req.body.password;
    const user = await userModel.findByEmail(email);
    // console.log(user) ;
    if (user.length === 0) {
      return next(new appError("fail" , "Email Not Found" , 401)) ;
    }
    //   console.log(user) ;
    const match = await bcrypt.compare(pwd, user[0].password);
    // console.log(match);
    if (!match) {
      return next(new appError("fail" , "Incorrect email or password!" , 401)) ;
    }
    const token = jwt.sign({ id: user[0].id }, process.env.jwtSecret, {
      expiresIn: "1d",
    });
    res.cookie('jwt' , token , {
      expires : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) ,
      secure : true ,
      httpOnly : true 
    });
    req.user = user[0];
    res.status(200).json({
      status: "Success",
      token,
      message: "User logged in successfully",
    });
  } catch (err) {
    // console.log(err) ;
    next(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt ;
    // console.log(token);
    if (!token) {
      return next(new appError("fail" , "You are not logged In, Please Log in to access ." , 401)) ;
    }
    const decode = await promisify(jwt.verify)(token, process.env.jwtSecret);
    // console.log(decode.id);
    const user = await userModel.findById(decode.id);
    // console.log(user) ;
    req.user = user[0];
    // console.log('hi') ;
    next() ;
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // find user by email :
    const email = req.body.email;
    const user = await userModel.findByEmail(email);
    if (user.length === 0) {
      return next(new appError("fail" , "No such user exists!" , 404)) ;
    }

    // create token for resetting pwd 
    const token = createPasswordToken(user[0].id) ;

    // send email 

    sendEmail({
      email : "Your-email" ,
      subject : "resetting password" ,
      text : `http://localhost:3000/resetpassword/${token}`
    });
    res.json({
      status : "success" ,
      message : "email sent successfully!" 
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req , res , next) => {
  try {
    const token = req.params.token ;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex') ;
    const user = await userModel.findByToken(hashedToken) ;
    if(!user){
      return next(new appError("fail" , "No such user" , 401)) ;
    }
    const password = req.body.password ;
    const confirmPassword = req.body.confirmPassword ;
    if(password !== confirmPassword){
      return next(new appError("fail" , "Passwords do not match" , 401)) ;
    }
    bcrypt
    .hash(password, 12)
    .then((hash) => {
      return userModel.updateUserPassword(user, hash);
    })
    .then((r) => {
      return res.status(201).json({
        status: "success",
        message: "Password updated successfully",
      });
    })
    .catch((err) => {
      next(err);
    });
  } catch(err) {
    next(err);
  }
};  