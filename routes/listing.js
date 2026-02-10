const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listings.js")
const mongoose = require("mongoose");
const multer=require('multer')
const {storage}=require("../cloudConfig.js")
const upload=multer({storage})


//                                     MIDDLEWARES
// ObjectId Validator
const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ExpressError(404, "Page Not Found"));
    }
    next();
};

// Listing Validator
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(400, errMsg));
    }
    next();
};


// Index
router.get("/", wrapAsync(listingController.index));


// NEW
router.get("/new", isLoggedIn, listingController.new);


// show
router.get("/:id",
    validateObjectId,
    wrapAsync(listingController.show)
);



router.post("/",
    isLoggedIn,
    upload.single("listing[image]"),
    wrapAsync(listingController.create)
);





//EDIT

router.get("/:id/edit",
    validateObjectId,
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.edit)
);

// Update
router.put("/:id",
    validateObjectId,
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),

    validateListing,
    wrapAsync(listingController.update)
);

// DELETE
router.delete("/:id",
    validateObjectId,
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.delete)
);

module.exports = router;
