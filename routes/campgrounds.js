const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const Joi = require("joi");
const { isLoggedin } = require("../middlewares");

// validating Campgrounds Creation
const validateCampgrounds = (req, res, next) => {
  const campgroundSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
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
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    try {
      const newCampground = new Campground(req.body);
      await newCampground.save();
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
      const campground = await Campground.findById(id).populate("reviews");
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
  validateCampgrounds,
  catchAsync(async (req, res, next) => {
    try {
      const { id } = req.params;
      const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body,
      });
      req.flash("success", "Successfully edited a Campground!");
      res.redirect(`/campgrounds/${campground._id}`);
    } catch (e) {
      next(e);
    }
  })
);

// Delete Campground
router.delete("/:id", isLoggedin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a Campground!");
    res.redirect("/campgrounds");
  } catch (e) {
    next(e);
  }
});

module.exports = router;
