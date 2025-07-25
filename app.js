const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js'); // Import the User model

const dbUrl = process.env.ATLAS_DB_URL;

// Importing routes
const userRouter = require('./routes/user.js');
const reviewRouter = require('./routes/review.js');
const listingsRouter = require('./routes/listing.js');

// Connecting to the database
main()
  .then(() => {
    console.log('Connection successful');
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

// Add them later 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static("public"));

// Session configuration
const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user; // Make currentUser available in all templates 
  next();   
});

// app.get("/demouser", async (req, res) => {
//  let fakeUser = new User({
//    email: "student@gmail.com",
//    username: "delta-student"
//  });
//  let registeredUser = await User.register(fakeUser, "helloworld");
//  res.send(registeredUser);
// });


app.use('/listings',listingsRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);


app.all('*', (req, res, next) => {
  next(new ExpressError(404,'Page Not Found!'));
});

app.use((err, req, res, next) => {
  let{statusCode=500, message="Something went wrong!"} = err;
  res.status(statusCode).render('error', { statusCode, message });
  console.error(err);
});

app.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
