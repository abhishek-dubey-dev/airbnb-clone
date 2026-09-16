const express= require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExressError");

const Review = require("../models/review");
const listing = require("../models/listing");
const { isLoggedIn, validateReviewMiddleware, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

//Review route
//POST route
router.post(
  "/",
  isLoggedIn,
  validateReviewMiddleware,
  wrapAsync(reviewController.createReview));


//DELETE Review route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;