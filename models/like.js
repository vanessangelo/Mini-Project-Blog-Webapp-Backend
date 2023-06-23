"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Like.belongsTo(models.Blog, {
        foreignKey: "blog_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        hooks: true,
      });
      Like.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: "cascade",
        onUpdate: "CASCADE",
        hooks: true,
      });
    }
  }
  Like.init(
    {
      blog_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Like",
      timestamps: false,
    }
  );
  return Like;
};
