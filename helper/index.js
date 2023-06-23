const path = require("path");
module.exports = {
  convertFromDBtoRealPath(dbvalue) {
    return `${process.env.BASE_PATH}${dbvalue}`;
  },
  setFromFileNameToDBValueProfile(filename) {
    return `/Public/imgProfile/${filename}`;
  },
  setFromFileNameToDBValueBlog(filename) {
    return `/Public/imgBlog/${filename}`;
  },
  getFileNameFromDbValue(dbValue) {
    if (!dbValue || dbValue === "") {
      return "";
    }
    const split = dbValue.split("/");
    if (split.length < 4) {
      return "";
    }
    return split[3];
  },
  getAbsolutePathPublicFileProfile(filename) {
    return path.join(__dirname, "..", "Public", "profile", filename);
  },
  getAbsolutePathPublicFileBlog(filename) {
    return path.join(__dirname, "..", "Public", "blog", filename);
  },
};
