const Listing=require("./models/listing")
const Review=require("./models/review")


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl=req.originalUrl
        req.flash("error", "you must logged in to create listing")
        return res.redirect("/login")
    }
    next();
}
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl; // 🔥 VERY IMPORTANT
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission as you are not the owner");
        return res.redirect(`/listings/${listing._id}`);
    }

    req.listing = listing;

    next();   // ⭐ VERY IMPORTANT
};
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review does not exist");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    req.review = review;
    next();
};
