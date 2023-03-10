const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// const { Schema } = mongooose;

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'PLease telll us your name'] },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'guide-lead'],
    default: 'user',
  },
  email: {
    type: String,
    required: [true, 'PLease telll us your name'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'should input valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'PLease telll us your name'],
    // at least eight characters

    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'PLease telll us your name'],
    // give a new function??????
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'confirmation password must be the same as your password',
    },
  },
  passwordChangeAt: Date,
  passwordForget: String,
  passwordResetExpires: String,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // only run if password modefied
  if (!this.isModified('password')) return next();
  //with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

//related to data itself
userSchema.methods.correctPassword = async function (
  reqPassword,
  userPassword
) {
  // console.log(reqPassword);
  // console.log(userPassword);
  const rest = await bcrypt.compare(reqPassword, userPassword);
  return rest;
};

userSchema.methods.changePasswordAfter = async function (JWTTIMESTAMP) {
  // console.log(`timestamp:${JWTTIMESTAMP}`);
  // console.log(`changedAt ${this.passwordChangeAt}`);
  if (this.passwordChangeAt) {
    const changeAtTimestamp = this.passwordChangeAt.getTime() / 1000;
    // console.log(this.passwordChangeAt) //1665360000000
    console.log(changeAtTimestamp, JWTTIMESTAMP);
    return changeAtTimestamp > JWTTIMESTAMP; //200>100
  }
  return false;
};

userSchema.methods.resetPassword = async function () {
  /**
   * reset token from request password toa a new one stored in DB
   */
  const ranToken = crypto.randomBytes(32).toString('hex');
  this.passwordForget = crypto
    .createHash('sha256')
    .update(ranToken)
    .digest('hex');
  // crypto.createHash('sha256').digest();
  // 1000 1 secends, 60 *1000 1 min
  this.passwordResetExpires = Date.now() + 60 * 1000 * 30;

  console.log(this.passwordForget, ranToken);
  // 7d737fb832dd0c0e6f01c152c474bb282f6b3968f4ea6e68afe76489e37be35a 1665433863007
  return ranToken;
};

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;
