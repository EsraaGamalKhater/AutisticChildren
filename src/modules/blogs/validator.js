import Joi from 'joi';
import i18n from '../../utiles/i18n.js';

const getLanguage = (req) => {
    return req.headers["accept-language"] === "ar" ? "ar" : "en";
};


export const addBlogSchema = (req) => {
    const lang = getLanguage(req);
    return Joi.object({
        title: Joi.string().min(3).required().messages({
            "string.min": i18n.__({ phrase: "title must be at least 3 characters", locale: lang }),
            "any.required": i18n.__({ phrase: "title is required", locale: lang })
        }),
        selectedActivity: Joi.string().required().messages({
            "any.required": i18n.__({ phrase: "category is required", locale: lang })
        }),
        date: Joi.date().required().messages({
            "any.required": i18n.__({ phrase: "date is required", locale: lang })
        }),
        reminder: Joi.string().required().messages({
            "any.required": i18n.__({ phrase: "reminder is required", locale: lang })
        }),
        repeater: Joi.string().required().messages({
            "any.required": i18n.__({ phrase: "repeater is required", locale: lang })
        }),
        time: Joi.string().required().messages({
            "any.required": i18n.__({ phrase: "time is required", locale: lang })
        }),
        daysOfWeek: Joi.alternatives().try(
            Joi.string().valid('Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'All day'),
            Joi.array().items(Joi.string().valid('Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'All day'))
        ).required().messages({
            "any.required": i18n.__({ phrase: "day is required", locale: lang })
        }),
        image: Joi.string(),
        createdBy: Joi.string(),
    }).required();
};
