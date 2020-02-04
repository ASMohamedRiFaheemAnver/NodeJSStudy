exports.getLogin = (req, res, next) => {
  // req.isLoggedIn =
  //   req
  //     .get("Cookie")
  //     .split(";")[3]
  //     .split("=")[1] === "true";

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthendicated: req.isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  req.session.isLoggedIn = true;
  res.redirect("/");
};
