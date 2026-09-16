const User=require("../models/user");

module.exports.renderSignupForm=(req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup=async (req, res) => {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return res.status(500).send("Unable to log in after signup");
      }
      req.flash("success", "Welcome to WanderLust!");
      const redirectUrl = res.locals.redirectUrl || "/listings";
      delete req.session.redirectUrl;
      res.redirect(redirectUrl);
    });
  }



  module.exports.renderLoginForm=(req, res) => {
  res.render("users/login.ejs");
  }


  module.exports.login=  async(req, res) => {
    req.flash("success", "Welcome back to WanderLust!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
  };


module.exports.logout=(req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};