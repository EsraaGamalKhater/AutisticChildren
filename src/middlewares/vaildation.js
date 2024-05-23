import { Types } from "mongoose";
import i18n from '../utiles/i18n.js'; 


export const isValidObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? value
    : helper.message(i18n.__("invalid objectid!"));
};

export const isValid = (Schema) => {
  return (req, res, next) => {
    const schema = Schema(req); 
    const validationResult = schema.validate(req.body, { abortEarly: false });

    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map(detail => detail.message);
      const errorMessage = errorMessages.length > 0 ? errorMessages[0] : i18n.__("Invalid request data. Please check your input.");
      return res.status(400).json({ cause: 400, message: errorMessage });
    }
    return next();
  };
};






