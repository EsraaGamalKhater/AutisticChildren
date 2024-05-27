import blogmodel from "../../../../DB/Models/blog.model.js";
import cloudinary from "../../../Services/cloud.js";
import schedule from 'node-schedule';
import moment from 'moment';
import { promises as fs } from 'fs';
import path from 'path';

// Function to load translations
const loadTranslations = async (lang) => {
    const localesDir = path.join(process.cwd(), 'src', 'utiles', 'locales');
    const filePath = path.join(localesDir, `${lang}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Failed to load translations for ${lang}: ${error.message}`);
    }
};

// Array of predefined todo items
const todos = [
    { id: "1", title: 'Quiz Time', autoAdd: true, autoImage: 'https://res.cloudinary.com/dlge2bvzk/image/upload/v1713464225/qi9na4ohhn08ferriwoo.png' },
    { id: "2", title: 'Medicine Time', autoAdd: true, autoImage: 'https://res.cloudinary.com/dlge2bvzk/image/upload/v1713464225/szzp95xemz10vpontezr.png' },
    { id: "3", title: 'Worship Time', autoAdd: true, autoImage: 'https://res.cloudinary.com/dlge2bvzk/image/upload/v1713464225/cyg26jjzcjyicxmdsait.png' },
    { id: "4", title: 'Food Time', autoAdd: true, autoImage: 'https://res.cloudinary.com/dlge2bvzk/image/upload/v1713464225/gojjsxun6satimag4iei.png' },
    { id: "5", title: 'Play Time', autoAdd: true, autoImage: 'https://res.cloudinary.com/dlge2bvzk/image/upload/v1713464225/kvbi2qmjbvxazdexfxr5.png' },
    { id: "6", title: 'Watch TV', autoAdd: true, autoImage: 'https://res.cloudinary.com/dlge2bvzk/image/upload/v1713464226/lnlrzv9wpxrwsfnkbfxl.png' },
    { id: "7", title: 'Teeth Brushing', autoAdd: true, autoImage: 'https://res.cloudinary.com/dlge2bvzk/image/upload/v1713464225/r7jgynviehf9lkrciwbv.png' },
    { id: "8", title: 'Sleep Time', autoAdd: true, autoImage: 'https://res.cloudinary.com/dlge2bvzk/image/upload/v1713464459/doghkybtnmrxgfn5vkk0.png' }
];

//////////////////getTodos////////////

export const getTodos = async (req, res) => {
    try {
        const lang = req.headers['accept-language'] === 'ar' ? 'ar' : 'en';
        const translations = await loadTranslations(lang);

        const translatedTodos = todos.map(todo => ({
            id: todo.id,
            title: translations[todo.title] || todo.title,
            autoAdd: todo.autoAdd,
            autoImage: todo.autoImage
        }));

        res.status(200).json({ todos: translatedTodos });
    } catch (error) {
        console.error("Error translating todos:", error);
        res.status(500).json({ cause: 500, message: "Internal Server Error" });
    }
};


//////////////////addBlog//////////////
export const addBlog = async (req, res) => {
    const { title, selectedActivity, time, reminder, repeater} = req.body;

    // Check if both title or selectedActivity are provided
    if (!(title || selectedActivity)) {
        return res.status(400).json({ cause: 400, message: req.translate('Please provide either title and category') });
    }
    // Find the selected todo item
    const selectedTodo = selectedActivity ? todos.find(todo => todo.title === selectedActivity) : null;

    let image = null;

    if (selectedTodo && selectedTodo.autoAdd) {
        // Add the predefined image if autoAdd is true
        image = { id: selectedTodo.autoImage, url: selectedTodo.autoImage };
    } else if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path);
        // Assign image details to the image object
        image = { id: public_id, url: secure_url };
    }

    // Use Moment.js to parse and format the time if provided
    let formattedTime = null;
    if (time) {
        const parsedTime = moment(time, 'h:mm a'); // تحويل الوقت إلى صيغة Moment.js
        formattedTime = parsedTime.isValid() ? parsedTime.format('h:mm A') : null; // تنسيق الوقت إلى الصيغة المطلوبة
    }

    // Create the blog entry
    const added = await blogmodel.create({
        title: title || selectedActivity || 'Untitled',
        selectedActivity: selectedActivity,
        daysOfWeek: req.body.daysOfWeek,
        date: req.body.date,
        time: formattedTime, // تخزين الوقت المنسق
        reminder: reminder || null, // Add the reminder to the entry
        repeater: repeater || null,
        createdBy: req.user._id,
        image: image,
    });

    // Check if alarm time is provided by the user
    const alarmTime = formattedTime ? moment(formattedTime, 'h:mm A').toDate() : null;
    let alarmDate;

    // Determine the alarm date based on the reminder option
    switch (reminder) {
        case 'On Time':
            alarmDate = new Date(alarmTime);
            break;
        case '5 minutes before':
            alarmDate = alarmTime ? moment(alarmTime).subtract(5, 'minutes').toDate() : null;
            break;
        case '15 minutes before':
            alarmDate = alarmTime ? moment(alarmTime).subtract(15, 'minutes').toDate() : null;
            break;
        case '30 minutes before':
            alarmDate = alarmTime ? moment(alarmTime).subtract(30, 'minutes').toDate() : null;
            break;
        default:
            alarmDate = null;
    }

    // Schedule an alarm if a valid alarm date is determined
    if (alarmDate && !isNaN(alarmDate.getTime())) {
        schedule.scheduleJob(alarmDate, async () => {
            console.log(`Alarm triggered for blog: ${req.body.title || req.body.selectedActivity}`);
        });

        // Schedule the repeater based on repeaterType
        if (repeater) {
            switch (repeater) {
                case 'weekly':
                    scheduleWeeklyRepeater(alarmDate);
                    break;
                case 'monthly':
                    scheduleMonthlyRepeater(alarmDate);
                    break;
                case '3-month':
                    scheduleThreeMonthRepeater(alarmDate);
                    break;
                case '6-month':
                    scheduleSixMonthRepeater(alarmDate);
                    break;
                default:
                    break;
            }
        }
    }
    return res.status(201).json({ message:req.translate("task added successfully"), added });

};

// Function to schedule weekly repeater
const scheduleWeeklyRepeater = (alarmDate) => {
    const nextAlarmDate = moment(alarmDate).add(1, 'week').toDate();
    schedule.scheduleJob(nextAlarmDate, () => {
        // Schedule the next weekly repeater
        scheduleWeeklyRepeater(nextAlarmDate);
    });
};

// Function to schedule monthly repeater
const scheduleMonthlyRepeater = (alarmDate) => {
    const nextAlarmDate = moment(alarmDate).add(1, 'month').toDate();
    schedule.scheduleJob(nextAlarmDate, () => {
        // Schedule the next monthly repeater
        scheduleMonthlyRepeater(nextAlarmDate);
    });
};

// Function to schedule every 3-month repeater
const scheduleThreeMonthRepeater = (alarmDate) => {
    const nextAlarmDate = moment(alarmDate).add(3, 'months').toDate();
    schedule.scheduleJob(nextAlarmDate, () => {
        // Schedule the next 3-month repeater
        scheduleThreeMonthRepeater(nextAlarmDate);
    });
};

// Function to schedule every 6-month repeater
const scheduleSixMonthRepeater = (alarmDate) => {
    const nextAlarmDate = moment(alarmDate).add(6, 'months').toDate();
    schedule.scheduleJob(nextAlarmDate, () => {
        console.log(`6-Month Repeater: Alarm triggered`);
        // Schedule the next 6-month repeater
        scheduleSixMonthRepeater(nextAlarmDate);
    });
};
////////////////deleteBlog///////////
export const deleteBlog = async (req, res) => {
    let { id } = req.params;
    let deleted = await blogmodel.findByIdAndDelete({ _id: id });
    if (!deleted) {
        return res.status(404).json({ cause: 404, message: req.translate("task not found" )});
    }
    return res.status(200).json({ message: req.translate("Deleted the task")});
};

///////////////////getBlogById/////////////
export const getBlogById = async (req, res) => {
    const { userId } = req.params;
    const blogs = await blogmodel.find({ createdBy: userId });
    if (!blogs) {
        return res.status(404).json({ cause: 404, message:req.translate( 'task not found' )});
    }
    return res.status(200).json({ message: req.translate("Done"), blogs });
};




/////////////////updateBlog///////////////////
export const updateBlog = async (req, res) => {
    const { id } = req.params;
    const { title, selectedActivity, time, reminder, repeater, daysOfWeek, date } = req.body;
    const validActivities = todos.map(todo => todo.title);
   

    // Find the selected todo item if provided
    const selectedTodo = selectedActivity ? todos.find(todo => todo.title === selectedActivity) : null;

    const existingBlog = await blogmodel.findById(id);
    if (!existingBlog) {
        return res.status(404).json({ cause: 404, message: req.translate('Task not found') });
    }

    // Handle image
    let image = existingBlog.image;

    if (selectedTodo && selectedTodo.autoAdd) {
        // Add the predefined image if autoAdd is true
        image = { id: selectedTodo.autoImage, url: selectedTodo.autoImage };
    } else if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path);
        // Assign image details to the image object
        image = { id: public_id, url: secure_url };
    }

    // Use Moment.js to parse and format the time if provided
    let formattedTime = existingBlog.time;
    if (time) {
        const parsedTime = moment(time, 'h:mm a');
        if (parsedTime.isValid()) {
            formattedTime = parsedTime.format('h:mm A');
        }
    }

    // Update the blog entry, ensuring null, undefined or empty values do not overwrite existing ones
    const updatedData = {
        title: title ? title : existingBlog.title,
        selectedActivity: selectedActivity ? selectedActivity : existingBlog.selectedActivity,
        daysOfWeek: Array.isArray(daysOfWeek) && daysOfWeek.length ? daysOfWeek : existingBlog.daysOfWeek,
        date: date ? date : existingBlog.date,
        time: formattedTime ? formattedTime : existingBlog.time,
        reminder: reminder ? reminder : existingBlog.reminder,
        repeater: repeater ? repeater : existingBlog.repeater,
        image: image,
    };

    const updated = await blogmodel.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updated) {
        return res.status(404).json({ cause: 404, message: req.translate('Task not found') });
    }

    // Check if alarm time is provided by the user
    const alarmTime = formattedTime ? moment(formattedTime, 'h:mm A').toDate() : null;
    let alarmDate;

    // Determine the alarm date based on the reminder option
    switch (reminder) {
        case 'On Time':
            alarmDate = new Date(alarmTime);
            break;
        case '5 minutes before':
            alarmDate = alarmTime ? moment(alarmTime).subtract(5, 'minutes').toDate() : null;
            break;
        case '15 minutes before':
            alarmDate = alarmTime ? moment(alarmTime).subtract(15, 'minutes').toDate() : null;
            break;
        case '30 minutes before':
            alarmDate = alarmTime ? moment(alarmTime).subtract(30, 'minutes').toDate() : null;
            break;
        default:
            alarmDate = null;
    }

    // Schedule an alarm if a valid alarm date is determined
    if (alarmDate && !isNaN(alarmDate.getTime())) {
        schedule.scheduleJob(alarmDate, async () => {
            console.log(`Alarm triggered for task: ${updated.title}`);
        });
    }

    return res.status(200).json({ message: req.translate('Task updated successfully'), updated });
};


