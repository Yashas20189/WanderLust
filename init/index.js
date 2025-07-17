const mongoose = require('mongoose'); // requiring mongoose to secondary file
const initData = require("./data.js"); // requring all data from data.js(location,etc)
const Listing = require("../models/listing.js");
// requires models(Blueprint) from model folder

const dbUrl = process.env.ATLAS_DB_URL;
main()
.then(() =>{
    console.log("Connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6870f9b37ac29a062d37263e",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
