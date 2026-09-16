const Listing = require("../models/listing");
const Review=require("../models/review");

module.exports.createReview=async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body.review;
    const foundListing = await Listing.findById(id);

    if (!foundListing) {
      return res.status(404).send("Listing not found");
    }

    const newReview = new Review({ comment, rating, author: req.user._id });
    await newReview.save();
    foundListing.reviews.push(newReview);
    await foundListing.save();
    req.flash("success", "Review added successfully");
    res.redirect(`/listings/${id}?success=Review added successfully`);
  }


  module.exports.destroyReview=async(req, res) => {
    let { id, reviewId } = req.params;
    const foundListing = await Listing.findById(id);
    if (!foundListing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    if (!foundListing.reviews.some((review) => review.equals(reviewId))) {
      req.flash("error", "Review not found for this listing");
      return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully");
    res.redirect(`/listings/${id}?success=Review deleted successfully`);
  };