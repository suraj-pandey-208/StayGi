const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js")
const MONGO_URL = "mongodb://127.0.0.1:27017/pgdekho";
main().then(() => {
    console.log("connected to db")
})
    .catch((err) => {
        console.log("error has occured in the db", err);
    })



async function main() {
    await mongoose.connect(MONGO_URL);
}
const initDB = async () => {
    await Listing.deleteMany({});
   initData.data= initData.data.map((obj) => ({ ...obj, owner: '6983460f216274059befa62f' }))
    await Listing.insertMany(initData.data)
    console.log("db was intialized")
}
initDB();