const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const app = require("./app");
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Welcom to my natour database!🤞 ");
  });

const port = process.env.PORT || 2000;
app.listen(port, () => {
  console.log("listening on port " + port);
});

// console.log(process.env);

// const testTour = new Tour({
//   name: "Test Tour",
//   rating: 4.5,
//   price: 242,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log("error" + err);
//   });
