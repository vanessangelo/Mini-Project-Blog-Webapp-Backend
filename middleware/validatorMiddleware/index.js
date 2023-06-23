const { body, validationResult } = require("express-validator");
const db = require("../../models");

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res
      .status(400)
      .send({ message: "An error occurs", errors: errors.array() });
  };
};

// helper
const checkUsernameUnique = async (value, { req }) => {
  try {
    const user = await db.User.findOne({ where: { username: value } });
    if (user) {
      throw new Error("Username already taken");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkEmailUnique = async (value, { req }) => {
  try {
    const user = await db.User.findOne({ where: { email: value } });
    if (user) {
      throw new Error("Email already taken");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkPhoneUnique = async (value, { req }) => {
  try {
    const user = await db.User.findOne({ where: { phone: value } });
    if (user) {
      throw new Error("Phone number already taken");
    }
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  validateRegistration: validate([
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50")
      .custom(checkUsernameUnique),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter with email format")
      .custom(checkEmailUnique),
    body("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .isMobilePhone()
      .withMessage("Invalid phone number")
      .custom(checkPhoneUnique),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isStrongPassword({
        minLength: 6,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      })
      .withMessage(
        "Password required minimal 6 characters, 1 uppercase, 1 symbol, and 1 number"
      )
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          throw new Error("Confirm password does not match with password");
        }
        return true;
      }),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm password is required")
      .isLength({ min: 6 })
      .withMessage("Minimum password length is 6 characters"),
  ]),

  validateLogin: validate([
    body("credential").notEmpty().withMessage("Credential is required"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Minimum password length is 6 characters"),
  ]),

  validateForgetPassword: validate([
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter with email format"),
  ]),

  validateResetPassword: validate([
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isStrongPassword({
        minLength: 6,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      })
      .withMessage(
        "Password required minimal 6 characters, 1 uppercase, 1 symbol, and 1 number"
      )
      .custom((value, { req }) => {
        if (value !== req.body.confirmNewPassword) {
          throw new Error("Confirm password does not match with password");
        }
        return true;
      }),
    body("confirmNewPassword")
      .notEmpty()
      .withMessage("Confirm new password is required")
      .isLength({ min: 6 })
      .withMessage("Minimum password length is 6 characters"),
  ]),

  validateChangeCredential: validate([
    body("username")
      .trim()
      .optional()
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50")
      .custom(checkUsernameUnique),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please enter with email format")
      .custom(checkEmailUnique),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number")
      .custom(checkPhoneUnique),
  ]),

  validateChangePassword: validate([
    body("oldPassword")
      .notEmpty()
      .withMessage("Old password is required")
      .custom((value, { req }) => {
        if (value == req.body.newPassword) {
          throw new Error("Please enter unique new password");
        }
        return true;
      }),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isStrongPassword({
        minLength: 6,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      })
      .withMessage(
        "Password required minimal 6 characters, 1 uppercase, 1 symbol, and 1 number"
      )
      .custom((value, { req }) => {
        if (value !== req.body.confirmNewPassword) {
          throw new Error("Confirm password does not match with password");
        }
        return true;
      }),
    body("confirmNewPassword")
      .notEmpty()
      .withMessage("Confirm new password is required")
      .isLength({ min: 6 })
      .withMessage("Minimum password length is 6 characters"),
  ]),

  validateCreateBlog: validate([
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 100 })
      .withMessage("Maximun title length is 100 characters"),
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ max: 1000 })
      .withMessage("Maximun content length is 1000 characters"),
    body("keywords")
      .trim()
      .optional()
      .isLength({ max: 50 })
      .withMessage("Maximun keywords length is 50 characters"),
    body("category_id").notEmpty().withMessage("Category is required"),
    body("link_URL")
      .optional()
      .isURL()
      .withMessage("Invalid link")
      .isLength({ max: 255 })
      .withMessage("Maximum link URL length is 255 characters"),
    body("country")
      .trim()
      .optional()
      .isLength({ max: 100 })
      .withMessage("Maximun country length is 100 characters"),
    body("file").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Image is required");
      }
      return true;
    }),
  ]),

  validateUpdateBlog: validate([
    body("title")
      .trim()
      .optional()
      .isLength({ max: 100 })
      .withMessage("Maximun title length is 100 characters"),
    body("content")
      .trim()
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Maximun content length is 1000 characters"),
    body("keywords")
      .trim()
      .optional()
      .isLength({ max: 50 })
      .withMessage("Maximun keywords length is 50 characters"),
    body("category_id").optional(),
    body("link_URL")
      .optional()
      .isURL()
      .withMessage("Invalid link")
      .isLength({ max: 255 })
      .withMessage("Maximun link url length is 255 characters"),
    body("country")
      .trim()
      .optional()
      .isLength({ max: 100 })
      .withMessage("Maximun country length is 100 characters"),
  ]),
};
