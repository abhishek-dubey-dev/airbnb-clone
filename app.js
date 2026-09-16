require("dotenv").config();


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExressError");
const session = require("express-session");
const MongoStoreModule = require("connect-mongo");
const MongoStore = MongoStoreModule.MongoStore || MongoStoreModule.default || MongoStoreModule;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const port = process.env.PORT || 8080;
const sessionSecret = process.env.SESSION_SECRET || process.env.SECRET || "development-only-change-me";
const dbUrl = process.env.ATLASDB_URL || process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET && !process.env.SECRET) {
  throw new Error("SESSION_SECRET must be set in production");
}

if (!process.env.ATLASDB_URL && !process.env.MONGO_URL) {
  console.warn("ATLASDB_URL not found. Falling back to local MongoDB at mongodb://127.0.0.1:27017/wanderlust");
}

if (!process.env.SESSION_SECRET && !process.env.SECRET) {
  console.warn("SESSION_SECRET not found. Using a development-only default secret.");
}

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



main()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

async function main() {
  await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB");
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: sessionSecret,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* app.get("/", (req, res) => {
  res.send("Hello World");
}); */

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser =req.user;
  next();
});

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// app.get("/demouser", async (req, res) => {
 // let fakeUser = new User({
 //   email: "student@gmail.com",
//    username: "delta-student",
//  });

 // let registeredUser = await User.register(fakeUser, "helloworld");
 // res.send(registeredUser);
 //}); 

app.use("/listings", listingsRouter);

app.use("/listings/:id/reviews", reviewsRouter);

app.use("/", userRouter);

// Catch-all route for undefined routes
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Internal Server Error" } = err;
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((error) => error.message).join(", ");
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  } else if (err.name === "MulterError" || err.message === "Only image files are allowed") {
    statusCode = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : err.message;
  } else if (err instanceof ExpressError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  res.status(statusCode).render("error", { message, statusCode });
});
