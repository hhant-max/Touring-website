const User = require('../models/userModel');
const catchAsync = require('../utils/catchAync');
const AppError = require('../utils/appError');
const handler = require('./handler');

// const filterReq = (el,...allowFields) =>{el.forEach()};
// const filterReq = (obj,...allowFields) =>{Object.keys(obj).foreach(el =>{if allowFields.includes(el)})};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  /**
   * update user accout and email, not the password
   */
  // 1) post assword is forbidden

  // ? needs login ??

  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('not update password here', 400));
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  const newUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // console.log(newUser);

  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  // console.log(req.user);
  req.params.id = req.user.id;
  next();
};

exports.getUser = handler.getOne(User);
exports.createUser = handler.createOne(User);
exports.updateUser = handler.updateOne(User);
exports.deleteUser = handler.deleteOne(User);

// login : find user and return yes or not
// if yes: enter my page
// if not: create new one
// forget password function
