const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListingMiddleware } = require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer = require("multer");
const path = require("path");
const { storage } = require("../cloudConfig");
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = new Set([".jpg", ".jpeg", ".png"]);
    const allowedMimeTypes = new Set(["image/jpeg", "image/png"]);

    if (allowedExtensions.has(extension) && allowedMimeTypes.has(file.mimetype)) {
      return callback(null, true);
    }
    callback(new Error("Only image files are allowed"));
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
