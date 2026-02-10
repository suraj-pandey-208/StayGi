const User=require("../models/user")


module.exports.signupForm= (req, res) => {
    res.render("users/signup.ejs")
}



module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            req.flash("success", "user registered successfully");

            let redirectUrl = req.session.redirectUrl || "/listings";
            delete req.session.redirectUrl;

            res.redirect(redirectUrl);
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};


module.exports.renderLoginForm= (req, res) => {
    req.flash("errors")
    res.render("users/login.ejs")

}

module.exports.login= async(req, res) => {
req.flash("success","Welcome back to pg dekho");
let redirectUrl=res.locals.redirectUrl || "/listings";
res.redirect(redirectUrl)

}

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err)
        }
        req.flash("success"," You logged out")
        res.redirect("/listings");
    });
}