const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const {reviewSchema} = require('../schema.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const {isLoggedIn} = require('../middleware.js');

const validateReview = (req, res, next) => {
 let { error } = reviewSchema.validate(req.body);
 if (error) {
   let errMsg = error.details.map((el) => el.message).join(",");
   throw new ExpressError(400, errMsg);
 } else {
   next();
 }
};

// Reviews
// Post Route
router.post("/",isLoggedIn, validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // Assuming req.user is set by the isLoggedIn middleware
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("new review saved");
    req.flash('success', 'Created a new Review!');
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Review Route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted a new Review!');
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;