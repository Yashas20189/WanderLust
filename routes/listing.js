const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const {listingSchema} = require('../schema.js');
const ExpressError = require('../utils/ExpressError.js');
const Listing = require('../models/listing.js');
const { isLoggedIn,isOwner } = require('../middleware.js');

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// **Index Route**: Display all listings
router.get('/', async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
});

// **New Route**: Form for a new listing
router.get("/new", isLoggedIn, (req, res) => {
 res.render("listings/new.ejs");
});

// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}));


// **Create Route**: Create a new listing
router.post('/',
  validateListing,isLoggedIn,
  wrapAsync(async(req, res,next) => {
  let result = listingSchema.validate(req.body); // Validate the listing data
  console.log(result);
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id; // Set the owner of the listing to the current user
  await newListing.save();
  req.flash('success', 'Successfully created a new listing!');
  res.redirect('/listings');
})
);

// **Edit Route**: Form for editing a listing
router.get('/:id/edit',isLoggedIn, 
  isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render('listings/edit.ejs', { listing });
}));

// **Update Route**: Update the listing
//Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  })
);


// **Delete Route**: Delete a listing
router.delete('/:id',isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted a listing!');
  res.redirect('/listings');
}));

module.exports = router;
