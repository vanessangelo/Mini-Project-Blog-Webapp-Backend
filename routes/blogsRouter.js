const router = require("express").Router();
const blogController = require("../controller/blogController");
const authMiddleware = require("../middleware/authMiddleware");
const multerMiddleware = require("../middleware/multerMiddleware/blog");
const validatorMiddleware = require("../middleware/validatorMiddleware");

// router.use();

// create blog
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.verifyIsVerified,
  multerMiddleware.single("file"),
  validatorMiddleware.validateCreateBlog,
  blogController.createBlog
);

// like and unlike (action)
router.post(
  "/:action/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyIsVerified,
  blogController.blogAction
);

// all access
router.get("/top-likes", blogController.getTopLike); // get top like
router.get("/", blogController.getAllBlog); // get all blog (!limit 8) // search & toplike
router.get("/all-category", blogController.getAllCategory); // get list of category
router.get("/:id", blogController.getOneBlog); // get one blog

module.exports = router;
