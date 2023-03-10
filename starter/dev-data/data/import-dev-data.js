const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

/**
const fs = require('fs');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');

const Tour = require('../../models/tourModel');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Welcom to my natour database!🤞 ');
  });

const tours = fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8');

//with async
const tourImport = async () => {
  try {
    // await Tour.insertMany(JSON.parse(tours));
    await Tour.insertMany(JSON.parse(tours));
    console.log('data loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const tourDelete = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  tourImport();
} else if (process.argv[2] === '--delete') {
  tourDelete();
}
*/
//console.log(`${__dirname}/tours-simple.json`);
// const tours = JSON.parse(
//   fs.readFile(`${__dirname}/tours-simple.json`, 'utf-8', (err, data) => {
//     if (err) console.log(err);
//     console.log(`read all data. ${data.length}`);
//   })
// );
// const tours = fs.readFile(
//   `${__dirname}/tours-simple.json`,
//   'utf-8',
//   (err, data) => {
//     if (err) console.log(err);
//     console.log(`read all data. ${data.length}`);
//   }
// );

// console.log(tours);

// tourImport();

// write a functio vai process.argv

//here can use a unified aync function
// Tour.insertMany(tours)
//   .then(console.log('data inserted'))
//   .catch((err) => console.log(err));

// import data from json to mongodb

//read data from tours-simple.json

// write data into mdb

// 1. inderectly into mongodb

// pass 1. call function from controllers each time  no it needs munally from postman
