const Listing = require("../models/listing");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExressError");

module.exports.index =async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
}


module.exports.renderNewForm=(req, res) => {
  res.render("listings/new", { errors: [], listing: {} });
}


module.exports.showListing= async (req, res) => {
  const { id } = req.params;
  if (id === "new") {
    return res.redirect("/listings/new");
  }

  const foundListing = await Listing.findById(id).populate({path:"reviews", populate:{path:"author"}}).populate("owner");
  if (!foundListing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  res.render("listings/show", {
    foundListing,
    successMessage: req.query.success || "",
    mapboxToken: /^pk\./.test(process.env.MAPBOX_TOKEN || "")
      ? process.env.MAPBOX_TOKEN
      : "",
  });
}


module.exports.createListing=async (req, res, next) => {
    if (!req.file) {
      throw new ExpressError("An image is required", 400);
    }
    let url = req.file.path;
    let filename = req.file.filename;
    const listingData = {
      ...req.body,
      image: req.file
        ? { filename: req.file.filename, url: req.file.path }
        : req.body.image,
    };
    let result = listingSchema.validate(listingData, { abortEarly: false });
    if (result.error) {
      throw new ExpressError(
        result.error.details.map((err) => err.message).join(", "),
        400,
      );
    }
    const newListing = new Listing(listingData);
    newListing.owner= req.user._id;
    newListing.image={url, filename};
    await newListing.save();
    req.flash("success", "Listing created successfully");
    res.redirect(
      `/listings/${newListing._id}?success=Listing created successfully`,
    );
  }


  module.exports.editListing=async (req, res) => {
    const { id } = req.params;
    const foundListing = await Listing.findById(id);
    if (!foundListing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    if (!foundListing.owner || !foundListing.owner.equals(req.user._id)) {
      req.flash("error", "You don't have permission to edit this listing");
      return res.redirect(`/listings/${id}`);
    }
  let originalImageUrl = foundListing.image && foundListing.image.url;
    res.render("listings/edit", { foundListing, originalImageUrl });
}


module.exports.updateListing=async (req, res) => {
    const { id } = req.params;
    const existingListing = await Listing.findById(id);
   if (!existingListing) {
     req.flash("error", "Listing not found");
     return res.redirect("/listings");
   }
  if (!existingListing.owner || !existingListing.owner.equals(req.user._id)) {
     req.flash("error", "you don't have permission to edit");
     return res.redirect(`/listings/${id}`);
   }
    const listingData = {
      ...req.body,
      image: req.file
        ? { filename: req.file.filename, url: req.file.path }
        : existingListing.image,
    };
    const result = listingSchema.validate(listingData, { abortEarly: false });
    if (result.error) {
      const validationErrors = result.error.details.map((err) => err.message);
      return res.status(400).render("listings/edit", {
        foundListing: { ...existingListing.toObject(), ...req.body, _id: id },
        originalImageUrl: existingListing.image && existingListing.image.url,
        errors: validationErrors,
      });
    }
    const updatedListing = await Listing.findByIdAndUpdate(id, listingData, {
      new: true,
      runValidators: true,
    });
    req.flash("success", "Listing updated successfully");
    res.redirect(
      `/listings/${updatedListing._id}?success=Listing updated successfully`,
    );
}


module.exports.destroyListing=async (req, res) => {
  const { id } = req.params;
  const existingListing = await Listing.findById(id);
  if (!existingListing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  if (!existingListing.owner || !existingListing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to delete this listing");
    return res.redirect(`/listings/${id}`);
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully");
  res.redirect("/listings");
}