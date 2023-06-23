const express = require("express");
//reminder: import the router
const router = require("./routes");
const db = require("./models");
const ErrorMidd = require("./middleware/errorMiddleware");

const app = express();
const PORT = 8000;

app.use(express.json());

app.use("/auth", router.auth);
app.use("/user", router.user);
app.use("/blog", router.blog);

// serving public file
app.use("/Public/imgProfile", express.static("Public/profile"));
app.use("/Public/imgBlog", express.static("Public/blog"));

//error handling
app.use(ErrorMidd.errorRouteNotFound);
app.use(ErrorMidd.errorHandler);

db.sequelize
  .authenticate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`app start on localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("failed to connect DB");
    console.error(error);
  });
