// setting up express and mongoose

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const AppError = require("./utils/appError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const campgroundRoute = require("./routes/campgrounds");
const reviewsRoute = require("./routes/reviews");
const userRoute = require("./routes/users");

mongoose.connect("mongodb://127.0.0.1:27017/yelpCamp");

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "thisissupersecret",
  resave: false,
  saveUninitialized: true,
  cookies: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// setting Routes

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/reviews", reviewsRoute);
app.use("/", userRoute);

// setting index page
app.get("/", async (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new AppError("Page Not Found", 404));
});

// setting Error handlers
app.use((err, req, res, next) => {
  const { message = "something went wrong", status = 500 } = err;
  res.status(status).render("error", { message, status });
});

app.listen("3000", () => {
  console.log("connected to port 3000");
});
