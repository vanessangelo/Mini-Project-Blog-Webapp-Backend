const db = require("../models");
const {
  setFromFileNameToDBValueProfile,
  getFileNameFromDbValue,
  getAbsolutePathPublicFileProfile,
} = require("../helper");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require("fs");
const hbs = require("handlebars");
const bcrypt = require("bcryptjs");

const transporter = nodemailer.createTransport({
  service: process.env.MY_SERVICE,
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASS,
  },
});

module.exports = {
  async getMyProfile(req, res) {
    try {
      const myProfile = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        attributes: {
          exclude: ["password"],
        },
      });

      if (!myProfile) {
        return res.status(404).send({
          message: "Profile not found",
          errors: error.message,
        });
      }
      res.send({ message: "Get profile success", data: myProfile });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Fatal error on server", errors: error.message });
    }
  },

  async changeImgProfile(req, res) {
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
      });

      if (!user) {
        return res.status(404).send({
          message: "User not found",
        });
      }

      // error handling
      if (!req.file) {
        return res
          .status(400)
          .send({ message: "No file found. Please upload the file" });
      }

      const realImgProfile = user.getDataValue("imgProfile"); // /public/img-xxx
      const oldFileName = getFileNameFromDbValue(realImgProfile); // img-xxx
      if (oldFileName) {
        fs.unlinkSync(getAbsolutePathPublicFileProfile(oldFileName));
      }
      user.imgProfile = setFromFileNameToDBValueProfile(req.file.filename);

      await user.save();

      return res.status(200).send({
        message: "Profile image change successful",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

  async changeCredential(req, res) {
    const { username, email, phone } = req.body;
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
      });

      if (!user) {
        return res.status(404).send({
          message: "User not found",
        });
      }

      if (username) {
        user.username = username;
      }
      if (phone) {
        user.phone = phone;
      }

      if (email) {
        const verifyToken = crypto.randomBytes(20).toString("hex");

        user.email = email;
        user.isVerified = false;
        user.verificationToken = verifyToken;

        const verifyLink = `${process.env.BASE_PATH_VERIFICATION}${verifyToken}`;

        const template = fs.readFileSync(
          "./helper/templateResendVerify.html",
          "utf-8"
        );
        const templateCompile = hbs.compile(template);
        const htmlResult = templateCompile({ username, verifyLink });

        const nodemailerEmail = {
          from: process.env.MY_EMAIL,
          to: email,
          subject:
            "Proccessing your update request. Please re-verify your email!",
          html: htmlResult,
        };

        transporter.sendMail(nodemailerEmail, (error, info) => {
          if (error) {
            return res.status(500).json({ error: "Error sending email" });
          }
        });
      }

      await user.save();

      // if email, ask to check email. else, no
      if (email) {
        return res.status(201).send({
          message:
            "Successfully update profile. Please check your email to re-verify your account",
          data: {
            username: user.username,
            email: user.email,
            phone: user.phone,
          },
        });
      } else {
        return res.status(201).send({
          message: "Successfully update profile",
          data: {
            username: user.username,
            email: user.email,
            phone: user.phone,
          },
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

  async changePassword(req, res) {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    try {
      const user = await db.User.findOne({
        where: {
          id: req.user.id,
        },
      });

      if (!user) {
        return res.status(404).send({
          message: "User not found",
        });
      }

      const isValid = await bcrypt.compare(oldPassword, user.password);

      if (!isValid) {
        return res.status(404).send({
          message: "Incorrect old password. Please try again",
        });
      }

      const hashPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashPassword;

      await user.save();

      return res.status(200).send({
        message: "Successfully change the password. Try logging in now!",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },
};
