const Listing=require("../models/listing")
const Review=require("../models/review")



// CREATE REVIEW



module.exports.createReview=(async (req, res) => {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }

        const newReview = new Review(req.body.review);
        newReview.author=req.user._id;
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();
   req.flash("success"," New Review created Successfully")
        res.redirect(`/listings/${listing._id}`);
    }

)
// DELETE  REVIEW ROUTE
module.exports.deleteReview=(async (req, res) => {
        const { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(
            id,
            { $pull: { reviews: reviewId } } // ✅ await added
        );

        await Review.findByIdAndDelete(reviewId);
   req.flash("success"," Review  deleted Successfully")
        res.redirect(`/listings/${id}`);
    })