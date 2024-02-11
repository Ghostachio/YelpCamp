const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const Joi = require("joi");
const { isLoggedin } = require("../middlewares");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// validating Campgrounds Creation
const validateCampgrounds = (req, res, next) => {
  const campgroundSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
  }).required();
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new routerError(msg, 400);
  }
  next();
};

// campgrounds List page
router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

// Create new Campground
router.get("/new", isLoggedin, (req, res) => {
  res.render("campgrounds/new");
});

router.post(
  "/",
  isLoggedin,
  upload.array("image"),
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    try {
      const newCampground = new Campground(req.body);
      newCampground.image = req.files.map((file) => ({ url: file.path, filename: file.filename }));
      newCampground.author = req.user._id;
      await newCampground.save();
      console.log(newCampground);
      req.flash("success", "Successfully made a new Campground!");
      res.redirect("/campgrounds");
    } catch (e) {
      next(e);
    }
  })
);

// individual Campground Page
router.get(
  "/:id",
  isLoggedin,
  catchAsync(async (req, res, next) => {
    try {
      const { id } = req.params;
      const campground = await Campground.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("author");
      if (!campground) {
        req.flash("error", "No Campground was found");
        return res.redirect("/campgrounds");
      }
      res.render("campgrounds/show", { campground });
    } catch (e) {
      next(e);
    }
  })
);

// Updating/changing a selected Campground data
router.get(
  "/:id/edit",
  isLoggedin,
  catchAsync(async (req, res, next) => {
    try {
      const { id } = req.params;
      const campground = await Campground.findById(id);
      res.render("campgrounds/edit", { campground });
    } catch (e) {
      next(e);
    }
  })
);

router.put(
  "/:id",
  isLoggedin,
  upload.array("image"),
  catchAsync(async (req, res, next) => {
    try {
      const { id } = req.params;
      const campground = await Campground.findById(id);
      const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
      if (!campground.author.equals(req.user._id)) {
        req.flash("error", "Not authorized to edit this campground");
        res.redirect(`/campgrounds/${id}`);
      } else {
        campground.title = req.body.title;
        campground.price = req.body.price;
        campground.description = req.body.description;
        campground.location = req.body.location;
        campground.image.push(...imgs);

        await campground.save();

        req.flash("success", "Successfully edited a Campground!");
        res.redirect(`/campgrounds/${campground._id}`);
      }
    } catch (e) {
      next(e);
    }
  })
);

// Delete Campground
router.delete("/:id", isLoggedin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const campgroundId = await Campground.findById(id);
    if (!campgroundId.author.equals(req.user._id)) {
      req.flash("error", "not authorized to edit this campground");
      res.redirect(`/campgrounds/${id}`);
    } else {
      await Campground.findByIdAndDelete(id);
      req.flash("success", "Successfully deleted a Campground!");
      res.redirect("/campgrounds");
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
