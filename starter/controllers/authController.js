const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAync');
const AppError = require('../utils/appError');
const { findOne } = require('../models/userModel');
const Email = require('../utils/email');
const catchAync = require('../utils/catchAync');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: `${process.env.JWT_EXPIRE}`,
  });
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      // attention for this number
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // console.log('signup');
  // console.log(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordChangeAt: req.body.passwordChangeAt,
  });

  // send email

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  sendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // check email and password
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('no email or pawwrod ', 404));

  //chech if username and password match
  const user = await User.findOne({ email }).select('+password');
  // compare user.pawword(encoded) incolllection with the password
  // console.log(`request pass${password}`);
  // console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    // for hacker not specify which is correct
    return next(new AppError('password not match or email', 404));
  }
  // send back the token
  sendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // get token if it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    // why add since the error
  } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError('you are not getting log in! PLase log in first', 401)
    );
  // validy token
  const valid = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(`valid jwt:${valid}`);
  if (!valid)
    return next(
      new AppError('you are not getting log in! PLase log in first', 401)
    );
  // console.log(valid); //{ id: '6343cb7493d9a7fd50e5f690', iat: 1665387381, exp: 1665390981 }

  // if user change password
  const freshUser = await User.findById({ _id: valid.id });
  if (!freshUser) return next(new AppError('User not exist', 401));

  // check ig password changes
  const changed = await freshUser.changePasswordAfter(valid.iat);
  if (changed)
    return next(
      new AppError('Password has changed , please log in again', 401)
    );
  // need to pass to next function
  req.user = freshUser;
  res.locals.user = freshUser;
  // freshUser.save();

  next();
});

//only for rendering, no error
exports.isLoggedIn = async (req, res, next) => {
  // get token if it exist
  try {
    if (req.cookies.jwt) {
      // (1) validy token
      const valid = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // console.log(`valid jwt:${valid}`);
      if (!valid) return next();
      // console.log(valid); //{ id: '6343cb7493d9a7fd50e5f690', iat: 1665387381, exp: 1665390981 }

      // if user change password
      const freshUser = await User.findById({ _id: valid.id });
      if (!freshUser) return next();

      // check ig password changes
      const changed = await freshUser.changePasswordAfter(valid.iat);
      if (changed) return next();
      // There is a login user
      res.locals.user = freshUser;
      return next();
      // return next()? vs next()
    }
  } catch (err) {
    return next();
  }

  next();
};

exports.logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success log out' });
});

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    const auth = roles.includes(req.user.role);
    // const auth = req.user
    // 'admin'includes(['admin','user'])?
    if (!auth)
      return next(new AppError('you have no acess to delete tour'), 404);

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //get user and assgin a random token

  const user = await User.findOne({ email: req.body.email });
  // console.log(user);
  if (!user)
    return next(
      new AppError('forget about getting a new password, you not exist'),
      404
    );
  // user.resetPassword();
  const resetToken = await user.resetPassword();
  await user.save({ validateBeforeSave: false });
  // console.log(resetToken);
  // attention please
  // await user.save({ validatdBeforeSave: false });

  // send back email
  const reset_url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/forget/${resetToken}`;

  // const email_options = {
  //   email: 'receiver@natour.com',
  //   subject: 'Reset Require',
  //   text: `Reset link: ${reset_url} did uyou get the reset link? it would be expired in 30 minutes`,
  // };
  // console.log(email_options)
  // await emailSend(email_options);

  try {
    // TODO
    // await emailSend(email_options);
    await new Email(user, reset_url).sendPasswordReset();

    res.status(200).json({
      message: 'Token sent to email!',
    });
  } catch (e) {
    user.passwordForget = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      message: 'error of getting token',
    });
    return next(new AppError('token die,try again', 500));
  }

  // next();
});

exports.resetPassword = async (req, res, next) => {
  // so send url with not crpted token so
  // resetToken: not encrypted!!!!!

  // get user based on token
  const hasedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(req.params.token, hasedToken);

  // tips! we can directly find user with that token insead of getting user and get token based on email and compare
  // const user = await findOne({ email: req.body.email });
  // if (hasedToken !== user.passwordForget)
  //   return next(new AppError('password dos not match database'));

  // check if expires: since expires is a titme string, so we need compare now with pasword expires
  const user = await User.findOne({
    passwordForget: hasedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  // console.log(user);

  if (!user) return next(new AppError('token is not valid or expired', 400));

  // ??? user request with body ??? yes with token and password
  ////set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordToken = undefined;
  await user.save();

  //3)change passwordChanged At

  // log user in
  sendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  // confirm if that's you by sedgin the password
  //1) get user from DB based on current password
  const user = await User.findById(req.user.id).select('+password');

  //2)check assword is correct
  // console.log(user);
  if (!user || !user.correctPassword(req.body.currPassword, user.password))
    return next(new AppError('password not match', 404));

  //3) update pssword
  // console.log(req.body);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //$) log in
  sendToken(user, 200, res);
};
