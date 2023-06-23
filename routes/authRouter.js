const router = require("express").Router();
const { auth: authController } = require("../controller/index");
const validatorMiddleware = require("../middleware/validatorMiddleware");

//register
router.post(
  "/register",
  validatorMiddleware.validateRegistration,
  authController.registerUser
);
//verify account
router.patch("/verify", authController.verifyUser);
//login
router.post(
  "/login",
  validatorMiddleware.validateLogin,
  authController.loginUser
);
//forget password
router.post(
  "/forget-password",
  validatorMiddleware.validateForgetPassword,
  authController.forgetPassword
);
//reset password
router.post(
  "/reset-password",
  validatorMiddleware.validateResetPassword,
  authController.resetPassword
);

module.exports = router;
