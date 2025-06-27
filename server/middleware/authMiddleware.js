const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    return next();
  }

  if (req.path.startsWith("/api")) {
    return res.status(401).json({ error: "Unouthorized" });
  }

  return res.redirect("/login");
};

const isAuthApi = (req, res, next) => {
  if (req.session.isAuth) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

module.exports = {
  isAuth,
  isAuthApi,
};
