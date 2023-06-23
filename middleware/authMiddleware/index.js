const jwt = require("jsonwebtoken");
const db = require("../../models");

module.exports = {
  // authentication
  async verifyToken(req, res, next) {
    // check token valid or not
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).send({
        message: "Token is not found",
      });
      return;
    }

    const [format, token] = authorization.split(" ");
    if (format.toLocaleLowerCase() === "bearer") {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!payload) {
          res.status(401).send({
            message: "Token verification failed",
          });
          return;
        }
        req.user = payload;
        next();
      } catch (error) {
        res.status(401).send({
          message: "Invalid token",
          error,
        });
      }
    }
  },

  // authorization
  async verifyRole(req, res, next) {
    if (req.user.role) {
      return next();
    }
    res.status(401).send({
      message: "Role is not allowed to access",
    });
  },

  // check is verified
  async verifyIsVerified(req, res, next) {
    const id = req.user.id;
    try {
      const checkVerified = await db.User.findOne({
        where: {
          id,
          isVerified: true,
        },
      });

      if (!checkVerified) {
        return res.status(401).send({
          message: "User is not verified",
        });
      }

      return next();
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
      });
    }
  },
};
