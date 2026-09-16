const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExressError");

module.exports.isLoggedIn = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(req.path, "..", req.originalUrl);
  }
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const existingListing = await Listing.findById(id);
  if (!existingListing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  if (!existingListing.owner || !existingListing.owner.equals(req.user._id)) {
    req.flash("error", "you are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListingMiddleware = (req, res, next) => {
  let { error } = listingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    let errorMessages = error.details.map((err) => err.message).join(", ");
    throw new ExpressError(
      error.details.map((err) => err.message).join(", "),
      400,
    );
  } else {
    next();
  }
};

module.exports.validateReviewMiddleware = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body, { abortEarly: false });
  if (error) {
    let errorMessages = error.details.map((err) => err.message).join(", ");
    throw new ExpressError(
      error.details.map((err) => err.message).join(", "),
      400,
    );
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const existingReview = await Review.findById(reviewId);
  if (!existingReview) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }
  if (!existingReview.author || !existingReview.author.equals(req.user._id)) {
    req.flash("error", "you are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};