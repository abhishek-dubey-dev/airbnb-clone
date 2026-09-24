const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const path = require("path");
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
    if (allowedTypes.has(file.mimetype) && allowedExtensions.has(extension)) {
      return callback(null, true);
    }
    callback(new Error("Only JPG, PNG, or WebP image files are allowed"));
  },
});

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single("image"), wrapAsync(listingController.createListing));

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm) ;

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, upload.single("image"), wrapAsync(listingController.updateListing))

.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));








//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));



module.exports = router;
