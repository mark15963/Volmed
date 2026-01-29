const allowedOrigins = [process.env.BACKEND_URL, process.env.FRONTEND_URL];

module.exports = function (req, res, next) {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  next();
};
