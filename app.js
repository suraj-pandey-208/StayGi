if(process.env.NODE_ENV !="production")
{
require('dotenv').config();

}
// const express = require("express");
// const app = express();
// const port = 5000;

// const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");

// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");

// const wrapAsync = require("./utils/wrapAsync.js");
// const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema } = require("./schema.js");
// const { reviewSchema } = require("./schema.js")
// const Review = require("./models/review.js")
// /* -------------------- SETUP -------------------- */
// const session=require("express-session")
// const flash=require("connect-flash")
// app.engine("ejs", ejsMate);
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// app.use(express.static(path.join(__dirname, "public")));
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
// const listings = require("./routes/listing.js");
// const reviews = require("./routes/review.js");
// const { clear } = require("console");
// /* -------------------- DATABASE -------------------- */

// const MONGO_URL = "mongodb://127.0.0.1:27017/pgdekho";
// async function main() {
//     await mongoose.connect(MONGO_URL);
//     console.log("connected to db");
// }
// main().catch(err => console.log("db error:", err));

// /* -------------------- SERVER -------------------- */

// app.listen(port, () => {
//     console.log(`app is listening on port ${port}`);
// });
// app.use("/listings", listings);
// app.use("/listings/:id/reviews", reviews);

// /* -------------------- MIDDLEWARE -------------------- */

// // ObjectId validator (CRITICAL)
// // const validateObjectId = (req, res, next) => {
// //     const { id } = req.params;
// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //         throw new ExpressError(404, "Page Not Found");
// //     }
// //     next();
// // };

// /* -------------------- ROUTES -------------------- */
// const sessionInfo={
//     secret:"secretCode123",
//     resave:false,
//     saveUninitialized:true,
//     cookie:{
//         expires:Date.now() + 7 * 24 * 60 * 60,
//         maxAge:7 * 24 * 60 * 60,
//         httpOnly:true

//     },
// }
// app.use(session(sessionInfo))
// app.use(flash())

// app.get("/", (req, res) => {
//     res.send("hello i am working directory");
// });

// app.use((req,res,next)=>{
//     res.locals.success=req.flash("success")
//     next()
// })

// app.use((req, res, next) => {
//     next(new ExpressError(404, "Page Not Found"));
// });



// app.use((err, req, res, next) => {
//     // Normalize Mongo errors
//     if (err.name === "CastError") {
//         err = new ExpressError(404, "Page Not Found");
//     }

//     const { statusCode = 500, message = "Something went wrong" } = err;
//     res.status(statusCode).render("listings/error.ejs", { message });
// });

// ----------------------------------------------------------------------------------------
const express = require("express");
const app = express();
const port = 5000;

const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const passport = require("passport")
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")

/* -------------------- SETUP -------------------- */
const session = require("express-session");
const MongoStore=require("connect-mongo").default
const flash = require("connect-flash");


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const userRouter=require("./routes/user.js")

// Database
const dbUrl=process.env.ATLASDB_URL;
async function main() {
    await mongoose.connect(dbUrl);
    console.log("connected to db");
}
main().catch(err => console.log("db error:", err));

/* -------------------- SESSION & FLASH -------------------- */

// const store=MongoStore.create(
// {
//     mongoUrl:dbUrl,
//     crypto: {
// secret:"secretCode123",
//     },

//     touchAfter:24*3600,
// })

// store.on("error",()=>{
//     console.log("Error in mongostore session")
// })



const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("MongoStore Session Error:", err);
});

const sessionInfo = {
    store:store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};


app.use(session(sessionInfo));
app.use(flash());
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



/* ⭐ FIXED MIDDLEWARE (MOVED ABOVE ROUTES) ⭐ */
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser=req.user;
    next();
});






/* -------------------- ROUTES -------------------- */
app.get("/", (req, res) => {
    res.redirect("/listings");
});


app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/",userRouter)

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
    if (err.name === "CastError") {
        err = new ExpressError(404, "Page Not Found");
    }

    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});

/* -------------------- SERVER -------------------- */
app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});
