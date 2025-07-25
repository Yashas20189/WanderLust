const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");  

// Only to show the form
router.get("/signup", (req, res) => {
 res.render("users/signup.ejs");
});

// Handle the signup form submission
// This route will create a new user in the database
router.post(
 "/signup",
 wrapAsync(async (req, res) => {
   try {
     let { username, email, password } = req.body;
     const newUser = new User({ email, username });
     const registeredUser = await User.register(newUser, password);
     console.log(registeredUser);
     req.login(registeredUser, (err) => {
       if (err) {
         return next(err);
       }
       req.flash("success", "Welcome to Wanderlust!");
       res.redirect("/listings");
     });
   } catch (e) {
     req.flash("error", e.message);
     res.redirect("/signup");
   }
 })
);

// Only to show the form
router.get("/login", (req, res) => {
 res.render("users/login.ejs");
});

// Handle the login form submission
router.post(
 "/login",
 saveRedirectUrl,
 passport.authenticate("local", {
   failureRedirect: "/login",
   failureFlash: true,
 }),
 async (req, res) => {
   req.flash("success", "Welcome back to Wanderlust!");
   let redirectUrl = res.locals.redirectUrl || "/listings";
   res.redirect(redirectUrl);
 }
);

router.get("/logout", (req, res) => {
 req.logout((err) => {
   if (err) {
     return next(err);
   }
   req.flash("success", "You are logged out!");
   res.redirect("/listings");
 });
});



module.exports = router;