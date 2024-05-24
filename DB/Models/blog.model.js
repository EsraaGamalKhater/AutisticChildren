import {mongoose,Schema }from "mongoose";

const blogschema = new mongoose.Schema({
    title: String,
    daysOfWeek:{
        type: [String],
        enum: ['Saturday','Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',"السبت", "الأحد","الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "كل الايام"]
    },
    
    image: {
        id: String,
        url: String
    },
    reminder: String,
    repeater:String,
    time:String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    date: {
        type: Date,
        required: true
    },
    selectedActivity: {
        type: String,
    }
}, {
    timestamps: true
});

const blogmodel = mongoose.model("Blog", blogschema);
export default blogmodel;
