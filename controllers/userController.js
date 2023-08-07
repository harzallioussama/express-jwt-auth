const userModel = require("../models/userModel");

exports.getAllUsers = async (req, res, next) => {
  // console.log("hello") ;
  try {
    const users = await userModel.findAll();
    res.json({
      status: "success",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await userModel.findById(id);
    res.json({
      status: "success",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
