const errorRouteNotFound = (req, res, next) => {
  const error = new Error("Route Not Found");
  error.status = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
};

module.exports = { errorHandler, errorRouteNotFound };
