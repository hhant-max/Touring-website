const express = require("express");
const fs = require("fs");
const path = require("path");
const { request } = require("http");
const morgan = require("morgan");
const { toUSVString } = require("util");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const AppError = require("./starter/utils/appError");
const errorController = require("./starter/controllers/errorController");
const cookieParser = require("cookie-parser");

const userRouter = require("./starter/routes/userRoute");
const tourRouter = require("./starter/routes/tourRoute");
const reviewsRouter = require("./starter/routes/reviewRoute");
const viewRouter = require("./starter/routes/viewRoute");
const bookingRouter = require("./starter/routes/bookingRoute");

const app = express();

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
// app.post("/", (req, res) => {
//   res.status(404).json({'message':"not found"});
// });

// global middleware
////////////////////////////////////////
// use tmemplate
app.set("view engine", "pug");
// know where it is
app.set("views", path.join(__dirname, "starter/views"));

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
//cookie
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// Serving static files
app.use(express.static(path.join(__dirname, "starter/public")));

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "data:", "blob:", "https:", "ws:"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        scriptSrc: [
          "'self'",
          "https:",
          "http:",
          "blob:",
          "https://*.mapbox.com",
          "https://js.stripe.com",
          "https://m.stripe.network",
          "https://*.cloudflare.com",
        ],
        frameSrc: ["'self'", "https://js.stripe.com"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.tiles.mapbox.com",
          "https://api.mapbox.com",
          "https://events.mapbox.com",
          "https://m.stripe.network",
        ],
        childSrc: ["'self'", "blob:"],
        imgSrc: ["'self'", "data:", "blob:"],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          "data:",
          "blob:",
          "https://*.stripe.com",
          "https://*.mapbox.com",
          "https://*.cloudflare.com/",
          "https://bundle.js:*",
          "ws://127.0.0.1:*/",
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", "data:", "blob:"],
//       baseUri: ["'self'"],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "data:", "blob:"],
//       objectSrc: ["'none'"],
//       imgSrc: ["'self'", "blob:", "data:", "https:"],
//       fontSrc: ["'self'", ...fontSrcUrls],
//       childSrc: ["'self'", "blob:"],
//       frameSrc: ["'self'", ...frameSrcUrls],
//       upgradeInsecureRequests: [],
//     },
//   })
// );

////////////////////////////////////////

// routes
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/bookings", bookingRouter);

app.use("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl}`, 404));
});

app.use(errorController);

module.exports = app;
