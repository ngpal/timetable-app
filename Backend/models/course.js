import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true }, 
    courseName: { type: String, required: true },
    theoryHours: { type: Number, default: 0 },
    labHours: { type: Number, default: 0 },
    department: { type: String, required: true } 
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
});

courseSchema.virtual('totalLoad').get(function() {
    return this.theoryHours + this.labHours;
});

const Course = mongoose.model('Course', courseSchema);
export default Course;