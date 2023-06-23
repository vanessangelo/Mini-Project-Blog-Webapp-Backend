const auth = require("./authRouter");
const user = require("./usersRouter");
const blog = require("./blogsRouter");

module.exports = {
  auth,
  blog,
  user,
};
