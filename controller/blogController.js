const db = require("../models");
const {
  setFromFileNameToDBValueBlog,
  getFileNameFromDbValue,
  getAbsolutePathPublicFileBlog,
} = require("../helper");
const fs = require("fs");

module.exports = {
  async createBlog(req, res) {
    try {
      const { title, content, keywords, link_URL, country, category_id } =
        req.body;

      if (req.file) {
        imgBlog = setFromFileNameToDBValueBlog(req.file.filename);
      }
      if (category_id >= 7) {
        return res.status(400).send({
          message: "Category is not listed",
        });
      }

      const blogs = await db.Blog.create({
        author_id: req.user.id,
        title,
        content,
        imgBlog,
        keywords: keywords || null,
        category_id,
        link_URL: link_URL || null,
        country: country || null,
      });

      return res.status(202).send({
        message: "Successfully created the blog",
        data: blogs,
      });
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        errors: error.message,
      });
    }
  },

  async getAllBlog(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      limitPerPage: Number(req.query.limitPerPage) || 10,
      search: req.query.search || undefined,
      category: req.query.category || undefined,
      sortBy: req.query.sortBy || "DESC",
    };
    try {
      const where = {};
      const order = [];

      if (pagination.search) {
        where[db.Sequelize.Op.or] = [
          {
            title: {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
          {
            keywords: {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
        ];
      }

      if (pagination.category) {
        where.category_id = pagination.category;
      }

      if (pagination.sortBy.toUpperCase() === "DESC") {
        order.push(["createdAt", "DESC"]);
      } else {
        order.push(["createdAt", "ASC"]);
      }

      const results = await db.Blog.findAll({
        where,
        include: [
          {
            model: db.User,
            attributes: ["username"],
            as: "author",
          },
          {
            model: db.Category,
            attributes: ["name"],
          },
        ],
        limit: pagination.limitPerPage,
        offset: (pagination.page - 1) * pagination.limitPerPage,
        order,
      });

      const countData = await db.Blog.count({ where });

      pagination.totalData = countData;

      res.send({
        message: "Successfully get blogs",
        pagination,
        data: results,
      });
    } catch (errors) {
      res.status(500).send({
        message: "Fatal error on server",
        errors: errors.message,
      });
    }
  },

  async getOneBlog(req, res) {
    const blogId = req.params.id;

    try {
      const blog = await db.Blog.findOne({
        where: { id: blogId },
        include: [
          {
            model: db.User,
            attributes: ["username"],
            as: "author",
          },
          {
            model: db.Category,
            attributes: ["name"],
          },
        ],
      });

      if (!blog) {
        return res.status(404).send({
          message: "Blog not found",
        });
      }

      res.send({
        message: "Successfully get a blog",
        data: blog,
      });
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        error: error.message,
      });
    }
  },

  async getMyBlog(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      limitPerPage: Number(req.query.limitPerPage) || 10,
    };
    try {
      const where = { author_id: req.user.id };
      const results = await db.Blog.findAll({
        where,
        include: [
          {
            model: db.User,
            attributes: ["username"],
            as: "author",
          },
          {
            model: db.Category,
            attributes: ["name"],
          },
        ],
        limit: pagination.limitPerPage,
        offset: (pagination.page - 1) * pagination.limitPerPage,
      });

      const countData = await db.Blog.count({ where });

      pagination.totalData = countData;

      res.send({
        message: "Successfully get my blogs",
        pagination,
        data: results,
      });
    } catch (errors) {
      res.status(500).send({
        message: "Fatal error on server",
        errors: errors.message,
      });
    }
  },

  async updateMyBlog(req, res) {
    const id = Number(req.params.id);
    const author_id = req.user.id;
    const { title, content, keywords, category_id, link_URL, country } =
      req.body;
    try {
      const getBlog = await db.Blog.findOne({
        where: {
          id,
          author_id,
        },
        include: [
          {
            model: db.User,
            attributes: ["username"],
            as: "author",
          },
          {
            model: db.Category,
            attributes: ["name"],
          },
        ],
      });
      if (!getBlog) {
        return res.status(400).send({
          message: "Blog not found",
        });
      }
      if (title) {
        getBlog.title = title;
      }
      if (content) {
        getBlog.content = content;
      }
      if (keywords) {
        getBlog.keywords = keywords;
      }
      if (category_id >= 7) {
        return res.status(400).send({
          message: "Category is not listed",
        });
      }
      if (category_id) {
        getBlog.category_id = category_id;
      }
      if (link_URL) {
        getBlog.link_URL = link_URL;
      }
      if (country) {
        getBlog.country = country;
      }
      if (req.file) {
        const realImgBlog = getBlog.getDataValue("imgBlog");
        const oldFileName = getFileNameFromDbValue(realImgBlog);
        if (oldFileName) {
          fs.unlinkSync(getAbsolutePathPublicFileBlog(oldFileName));
        }
        getBlog.imgBlog = setFromFileNameToDBValueBlog(req.file.filename);
      }

      await getBlog.save();
      res.send({ message: "Successfully updated the blog", data: getBlog });
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        errors: error.message,
      });
    }
  },

  async deleteMyBlog(req, res) {
    const id = Number(req.params.id);
    const author_id = req.user.id;
    try {
      const getBlog = await db.Blog.findOne({
        where: {
          id,
          author_id,
        },
      });
      if (!getBlog) {
        return res.status(400).send({
          message: "Blog doesn't exist",
        });
      }
      const imgBlog = getBlog.getDataValue("imgBlog");

      await getBlog.destroy();
      res.status(200).send({ message: "Successfully deleted the blog" });
      if (imgBlog) {
        fs.unlinkSync(
          getAbsolutePathPublicFileBlog(getFileNameFromDbValue(imgBlog))
        );
      }
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        errors: error.message,
      });
    }
  },

  async getAllCategory(req, res) {
    try {
      const getCategories = await db.Category.findAll({
        attributes: ["id", "name"],
      });

      if (getCategories.length === 0) {
        return res.status(400).send({ message: "No category found" });
      }
      return res.status(200).send({
        message: "Successfully get all categories",
        data: getCategories,
      });
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        errors: error.message,
      });
    }
  },

  async getTopLike(req, res) {
    try {
      const topLikes = await db.Like.findAll({
        attributes: [
          "blog_id",
          [db.sequelize.fn("COUNT", db.sequelize.col("user_id")), "likeCount"],
        ],
        include: [
          {
            model: db.Blog,
            include: [
              {
                model: db.User,
                attributes: ["username"],
                as: "author",
              },
              {
                model: db.Category,
                attributes: ["name"],
              },
            ],
          },
        ],
        group: ["blog_id"],
        order: [[db.sequelize.literal("likeCount"), "DESC"]],
        limit: 10,
      });

      if (topLikes.length == 0) {
        return res.status(404).send({
          message: "No liked blog/s",
        });
      }

      res.send({
        message: "Successfully retrieved top blogs",
        data: topLikes,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  async blogAction(req, res) {
    const id = parseInt(req.params.id);
    const action = req.params.action;
    const user_id = req.user.id;
    console.log(id, action, user_id);

    try {
      const getBlog = await db.Blog.findOne({
        where: {
          id,
        },
      });

      if (!getBlog) {
        return res.status(400).send({
          message: "Blog doesn't exist",
        });
      }

      const existingLike = await db.Like.findOne({
        where: {
          blog_id: id,
          user_id: user_id,
        },
      });

      switch (action) {
        case "like":
          if (existingLike) {
            return res.status(400).send({
              message: "Blog already liked by the user",
            });
          }

          await db.Like.create({
            attributes: ["id", "blog_id", "user_id"],
            blog_id: id,
            user_id: user_id,
          });

          return res.status(200).send({
            message: "Blog liked successfully",
          });

        case "unlike":
          if (!existingLike) {
            return res.status(400).send({
              message: "Blog was not liked by the user",
            });
          }

          const deletedLikeCount = await db.Like.destroy({
            where: {
              blog_id: id,
              user_id: user_id,
            },
          });

          if (deletedLikeCount === 0) {
            return res.status(400).send({
              message: "Failed to unlike the blog",
            });
          }

          return res.status(200).send({
            message: "Blog unliked successfully",
          });

        default:
          return res.status(400).send({
            message: "Invalid action",
          });
      }
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        errors: error.message,
      });
    }
  },

  async getLikedBlog(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      limitPerPage: Number(req.query.limitPerPage) || 10,
    };

    const where = { user_id: req.user.id };
    try {
      const likedBlogs = await db.Like.findAndCountAll({
        where,
        include: db.Blog,
        limit: pagination.limitPerPage,
        offset: (pagination.page - 1) * pagination.limitPerPage,
      });

      if (!likedBlogs) {
        return res.status(404).send({
          message: "User haven't liked any blog",
        });
      }
      const countData = likedBlogs.count;

      pagination.totalData = countData;
      console.log(countData, pagination);

      res.status(200).send({
        message: "Successfully get liked blog",
        pagination,
        data: likedBlogs,
      });
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        errors: error.message,
      });
    }
  },
};
