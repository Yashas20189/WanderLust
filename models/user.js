const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {        
        type: String,
        required: true,     
    }
});

userSchema.plugin(passportLocalMongoose);
// This will automatically add username and password fields to the user schema with hashing and salting for password security.  

module.exports = mongoose.model('User', userSchema);