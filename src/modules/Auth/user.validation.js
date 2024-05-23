import joi from "joi";
import i18n from '../../utiles/i18n.js'; 

const getLanguage = (req) => {
  return req.headers["accept-language"] === "ar" ? "ar" : "en";
};

export const signUpSchema = (req) => {
  const lang = getLanguage(req);
  return joi.object({
    userName: joi.string().min(3).max(40).required().messages({
      "string.min": i18n.__({ phrase: "Username must be at least 3 characters", locale: lang }),
      "string.max": i18n.__({ phrase: "Username cannot exceed 40 characters", locale: lang }),
      "any.required": i18n.__({ phrase: "Username is required", locale: lang })
    }),
    email: joi.string().email().required().messages({
      "string.email": i18n.__({ phrase: "Invalid email format", locale: lang }),
      "any.required": i18n.__({ phrase: "Email is required", locale: lang })
    }),
    password: joi.string().min(8).required().messages({
      'string.min': i18n.__({ phrase: 'Password must be at least 8 characters long', locale: lang }),
      'any.required': i18n.__({ phrase: 'Password is required', locale: lang }),
    }),
    confirmPassword: joi.string().valid(joi.ref("password")).required().messages({
      "any.only": i18n.__({ phrase: "Password and confirm Password must be match", locale: lang }),
      "any.required": i18n.__({ phrase: "confirm Password is required", locale: lang })
    }),
  }).required();
};

export const logInSchema = (req) => {
  const lang = getLanguage(req);
  return joi.object({
    email: joi.string().email().required().messages({
      "string.email": i18n.__({ phrase: "Invalid email format", locale: lang }),
      "any.required": i18n.__({ phrase: "Email is required", locale: lang })
    }),
    password: joi.string().required().messages({
      "any.required": i18n.__({ phrase: "Password is required", locale: lang })
    }),
  }).required();
};

export const forgetCodeSchema = (req) => {
  const lang = getLanguage(req);
  return joi.object({
    email: joi.string().email().required().messages({
      "string.email": i18n.__({ phrase: "Invalid email format", locale: lang }),
      "any.required": i18n.__({ phrase: "Email is required", locale: lang })
    }),
  }).required();
};

export const resetPasswordSchema = (req) => {
  const lang = getLanguage(req);
  return joi.object({
    forgetCode: joi.string().required().messages({
      "any.required": i18n.__({ phrase: "forgetCode is required", locale: lang })
    }),
    newPassword: joi.string().min(8).required().messages({
      'string.min': i18n.__({ phrase: 'Password must be at least 8 characters long', locale: lang }),
      'any.required': i18n.__({ phrase: 'Password is required', locale: lang }),
    }),
    confirmPassword: joi.string().valid(joi.ref("newPassword")).required().messages({
      "any.only": i18n.__({ phrase: "Password and confirm Password must be match", locale: lang }),
      "any.required": i18n.__({ phrase: "confirm Password is required", locale: lang })
    }),
  }).required();
};
