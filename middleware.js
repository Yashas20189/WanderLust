const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
 if (!req.isAuthenticated()) {
  req.session.redirectURL = req.originalUrl;
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
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "Your not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};