import joi from 'joi';
import i18n from '../../utiles/i18n.js';

const getLanguage = (req) => {
    return req.headers["accept-language"] === "ar" ? "ar" : "en";
};
const changePasswordSchema = (req) => {
    const lang = getLanguage(req);
    return joi.object({
        oldPassword: joi.string().required().messages({
            'any.required': i18n.__({ phrase: 'Old password is required', locale: lang }),

        }),
        newPassword: joi.string().min(8).invalid(joi.ref('oldPassword')).required().messages({
            'string.min': i18n.__({ phrase: 'Password must be at least 8 characters long', locale: lang }),
            'any.required': i18n.__({ phrase: 'Password is required', locale: lang }),
        }),

    }).required();
}

export {
    changePasswordSchema
};






