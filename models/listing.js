const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js'); // Import the Review model

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description:{
        type:String, 
        required: true
    } ,
    image: {
        filename: { type: String }, // Filename field
        url: {
            type: String, // URL field with a default value
            default: "https://images.lifestyleasia.com/wp-content/uploads/sites/7/2022/02/25111806/Untitled-design-95.jpg?tr=w-1200,h-900"
        }
    },
    price: {
        type:Number,
        required: true
    } ,
    location: {
        type:String,
        required:true
    },
    country: {
        type: String
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review" // Reference to the Review model
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User" // Reference to the User model
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing){
        // Delete all reviews associated with the listing
        await Review.deleteMany({ _id: { $in: listing.reviews } });
        }
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
