const router = require("express").Router();
const blogController = require("../controller/blogController");
const userController = require("../controller/userController");
const authMiddleware = require("../middleware/authMiddleware");
const multerMiddlewareProfile = require("../middleware/multerMiddleware/profile");
const multerMiddlewareBlog = require("../middleware/multerMiddleware/blog");
const validatorMiddleware = require("../middleware/validatorMiddleware");

router.use(authMiddleware.verifyToken);

// get profile
router.get("/", userController.getMyProfile);
router.delete("/", userController.deleteUser);

// change profile picture
router.patch(
  "/profile/change-picture",
  multerMiddlewareProfile.single("file"),
  userController.changeImgProfile
);

// change username, phone, email
router.patch(
  "/profile/change-credential",
  validatorMiddleware.validateChangeCredential,
  userController.changeCredential
);

// change password
router.patch(
  "/profile/change-password",
  validatorMiddleware.validateChangePassword,
  userController.changePassword
);

// get my blog
router.get("/my-blog", blogController.getMyBlog);

// update blog
router.patch(
  "/my-blog/:id",
  authMiddleware.verifyIsVerified,
  multerMiddlewareBlog.single("file"),
  validatorMiddleware.validateUpdateBlog,
  blogController.updateMyBlog
);

// delete blog
router.delete(
  "/my-blog/:id",
  authMiddleware.verifyIsVerified,
  blogController.deleteMyBlog
);

// get the blog user liked
router.get("/liked-blog", blogController.getLikedBlog);

module.exports = router;
