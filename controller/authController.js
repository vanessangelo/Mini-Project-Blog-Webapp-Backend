const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { User } = db;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require("fs");
const hbs = require("handlebars");
const dayjs = require("dayjs");

const transporter = nodemailer.createTransport({
  service: process.env.MY_SERVICE,
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASS,
  },
});
module.exports = {
  async registerUser(req, res) {
    // to send email

    const { username, email, phone, password, confirmPassword } = req.body;

    try {
      const isExist = await User.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ username }, { email }, { phone }],
        },
      });

      if (isExist) {
        res.status(400).send({
          message: "username/email/phone number already registered",
        });
        return;
      }

      //generate password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      const verifyToken = crypto.randomBytes(20).toString("hex");

      const newUser = await User.create({
        username,
        email,
        phone,
        password: hashPassword,
        imgProfile: null,
        isVerified: false,
        verificationToken: verifyToken,
        resetPasswordToken: null,
        expiredResetPasswordToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const verifyLink = `${process.env.BASE_PATH_VERIFICATION}${verifyToken}`;

      // handlebars
      const template = fs.readFileSync(
        "./helper/templateVerification.html",
        "utf-8"
      );
      const templateCompile = hbs.compile(template);
      const htmlResult = templateCompile({ username, verifyLink });

      const nodemailerEmail = {
        from: process.env.MY_EMAIL,
        to: email,
        subject: "Thank you for your registration. Please verify your account",
        html: htmlResult,
      };

      transporter.sendMail(nodemailerEmail, (error, info) => {
        if (error) {
          return res.status(500).json({ error: "Error sending email" });
        } else {
          return res.status(201).send({
            message: "Registration success. Please check your email to verify",
            data: {
              username: newUser.username,
              email: newUser.email,
              phone: newUser.phone,
            },
          });
        }
      });
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        errors: error.message,
      });
    }
  },

  async loginUser(req, res) {
    const { credential, password } = req.body;
    try {
      const user = await User.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { email: credential },
            { phone: credential },
            { username: credential },
          ],
        },
      });

      if (!user) {
        return res.status(400).send({
          message: "Login failed, incorrect identity/password",
        });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        // generate token authorization
        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
          expiresIn: "1h",
        });
        res.send({
          message: "Login successfully",
          data: {
            username: user.username,
            email: user.email,
            phone: user.phone,
          },
          accessToken: token,
        });
        return;
      } else {
        res.status(400).send({
          message: "Login failed, incorrect identity/password",
        });
      }
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        error,
      });
    }
  },

  async verifyUser(req, res) {
    const { token } = req.query;

    try {
      const user = await User.findOne({
        where: {
          verificationToken: token,
        },
      });

      if (!user) {
        return res.status(404).send({
          message: "Invalid token",
        });
      }

      await User.update(
        { isVerified: true, verificationToken: null },
        { where: { verificationToken: token } }
      );

      return res
        .status(200)
        .send({ message: "Thank you for the verification" });
    } catch (error) {
      return res.status(500).send({
        message: "Fatal error on server",
        error,
      });
    }
  },

  async forgetPassword(req, res) {
    const { email } = req.body;
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");

    const expirationDate = dayjs().add(1, "hour");
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).send({ error: "Account doesn't exist" });
      }

      user.resetPasswordToken = resetPasswordToken;
      user.expiredResetPasswordToken = expirationDate.toDate();
      await user.save();

      const resetLink = `${process.env.BASE_PATH_FORGETPASS}${resetPasswordToken}`;

      const template = fs.readFileSync(
        "./helper/templateResetPassword.html",
        "utf-8"
      );

      const templateCompile = hbs.compile(template);
      const htmlResult = templateCompile({
        username: user.username,
        resetLink,
      });

      const mailOptions = {
        from: process.env.MY_EMAIL,
        to: email,
        subject: "Forgot your password? Reset your password now!",
        html: htmlResult,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ error: "Fatal error on server" });
        } else {
          return res.status(201).send({
            message:
              "Email sent successfully. Please check your email to reset your password",
          });
        }
      });
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        error: error.message,
      });
    }
  },

  async resetPassword(req, res) {
    try {
      const { newPassword, confirmNewPassword } = req.body;
      const resetPasswordToken = req.query.token;

      const user = await db.User.findOne({
        where: { resetPasswordToken },
      });

      if (!user) {
        return res.status(404).send({
          message: "Token invalid",
        });
      }

      const tokenExpired = new Date(user.expiredResetPasswordToken);
      const now = new Date();

      if (now > tokenExpired) {
        return res.status(400).send({
          message: "token is expired",
        });
      }

      const hashPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashPassword;
      user.resetPasswordToken = null;
      user.expiredResetPasswordToken = null;

      await user.save();

      return res.status(200).send({
        message: "Successfully reset the password. Try logging in now!",
      });
    } catch (error) {
      res.status(500).send({
        message: "Fatal error on server",
        error: error.message,
      });
    }
  },
};
