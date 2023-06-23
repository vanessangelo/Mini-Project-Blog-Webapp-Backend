"use strict";
const { Model } = require("sequelize");
const { convertFromDBtoRealPath } = require("../helper");
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Blog.belongsTo(models.User, {
        foreignKey: "author_id",
        as: "author",
      });
      Blog.hasMany(models.Like, {
        foreignKey: "blog_id",
      });
      Blog.belongsTo(models.Category, {
        foreignKey: "category_id",
      });
    }
  }
  Blog.init(
    {
      author_id: DataTypes.INTEGER,
      imgBlog: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("imgBlog");
          if (rawValue) {
            return convertFromDBtoRealPath(rawValue);
          }
          return null;
        },
      },
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      keywords: DataTypes.STRING,
      category_id: DataTypes.INTEGER,
      link_URL: DataTypes.STRING,
      country: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Blog",
    }
  );
  return Blog;
};
