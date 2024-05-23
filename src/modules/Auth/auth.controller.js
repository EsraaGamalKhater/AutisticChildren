import { userModel } from '../../../DB/Models/usermodel.js'
import { sendEmailService } from '../../Services/sendEmailService.js'
import { generateToken, verifyToken } from '../../utiles/tokenFunction.js'
import { emailTemplate, forgetCodeTemp } from '../../utiles/emailTemplate.js'
import pkg from 'bcrypt';
import randomstring from "randomstring";

// ///////////// SignUp///////////
export const signUp = async (req, res, next) => {
  const { userName, email, password } = req.body
  ///////////// email check
  const isEmailDuplicate = await userModel.findOne({ email })
  if (isEmailDuplicate) {
    return res.status(400).json({ cause: 400, message: req.translate('email is already exist') })
  }
  const token = generateToken({ email }, process.env.SIGNUP_TOKEN,'1h');
  const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirm/${token}`
  const isEmailSent = sendEmailService({
    to: email,
    subject: req.translate('Confirmation Email'),
    message: emailTemplate({
      link:confirmationLink,
      linkData: req.translate('Click here to confirm'),
      subject: req.translate('Confirmation Email'),
    }),
  })

  if (!isEmailSent) {
    return res.status(400).json({ cause: 400, message: req.translate('fail to sent confirmation email') })
  }

  ///////// // hash password 
  const user = new userModel({ userName, email, password })
  const savedUser = await user.save()
  res.status(201).json({ message: req.translate('signUp successfully'), savedUser })
}

// ///////////////////confirm email
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params
  if (!token) {
    return res.status(400).json({ cause: 400, message: req.translate('token not exist') })
  }
  const decode = verifyToken(token, process.env.SIGNUP_TOKEN)
  if (!decode) {
    return res.status(400).json({ cause: 400, message: req.translate('Invalid token') })
  }
  const user = await userModel.findOneAndUpdate(
    { email: decode?.email, isConfirmed: false },
    { isConfirmed: true },
    { new: true },
  )
  if (!user) {
    return res.status(400).json({ cause: 400, message: req.translate('already confirmed') })
  }
  res.status(200).json({ message: req.translate('Confirmed done, please try to login') })
}

// /////////////////////Log In /////////////////
export const logIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ cause: 400, message: req.translate('Invalid email') });
  } else {
    if (!user.isConfirmed) { 
      return res.status(400).json({ cause: 400, message: req.translate('Please verify your email') });
    }
    const isPassMatch = pkg.compareSync(password, user.password);
    if (!isPassMatch) {
      return res.status(400).json({ cause: 400, message: req.translate('Invalid password!') });
    } else {
      const token = generateToken({ id: user._id, role: user.role }, process.env.LOGIN_TOKEN,'30d');
      const userUpdated = await userModel.findOneAndUpdate(
        { email },
        { token }, 
        { new: true }
      );
      res.status(200).json({ message: req.translate('Login successfully'), userUpdated }); 
    }
  }
};

// ///////////////forgetPassword///////////////////
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ cause: 400, message: req.translate('Invalid email') })
  }

  const code = randomstring.generate({
    length: 4,
    charset: "numeric",
  });

  user.forgetCode = code;
  await user.save();
  const emailSent = await sendEmailService({
    to: user.email,
    subject: req.translate("Reset password"),
    message: forgetCodeTemp(req.translate("Your reset code is") + code),
  });
  if (emailSent) {
    return res.json({ message: req.translate("Check your email!") });
  } else {
    return res.status(400).json({ cause: 400, message: req.translate('Something went wrong while sending the email!') });
  }
};

// ///////////////////////////////// reset password///////////// 
export const resetPassword = async (req, res, next) => {
  const { forgetCode, newPassword } = req.body;
  if (!forgetCode || !newPassword) {
    return res.status(400).json({ cause: 400, message: req.translate('Invalid request. Please provide forgetCode, and newPassword.') });
  }
  const user = await userModel.findOne({ forgetCode });

  if (!user) {
    return res.status(400).json({ cause: 400, message: req.translate('Invalid code or email.') });
  }

  user.password = newPassword;
  user.forgetCode = null;

  const resetedPassData = await user.save();

  if (!resetedPassData) {
    return res.status(500).json({ cause: 500, message: req.translate('Failed to reset password.') });
  }

  res.status(200).json({ message: req.translate('Password reset successfully.'), resetedPassData });
}
