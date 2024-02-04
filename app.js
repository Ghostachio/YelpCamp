// setting up express and mongoose

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const AppError = require("./utils/appError");

const campgroundRoute = require("./routes/campgrounds");
const reviewsRoute = require("./routes/reviews");

mongoose.connect("mongodb://127.0.0.1:27017/yelpCamp");

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// setting Routes
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/reviews", reviewsRoute);

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
