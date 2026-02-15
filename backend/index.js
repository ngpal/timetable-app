import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
dotenv.config();
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import AuthRoute from './routes/auth.route.js';
import FacultyRoute from './routes/faculty.route.js';
import CourseRoute from './routes/course.route.js';
import ClassroomRoute from './routes/classroom.route.js';
import DashboardRoute from './routes/dashboard.route.js';
import TimetableConstraintRoute from './routes/timetableConstraint.route.js';
import CourseAssignmentRoute from './routes/courseAssignment.route.js';
import GeneratorRoute from './routes/generator.route.js';
import RequestRoute from './routes/request.route.js';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', AuthRoute);
app.use('/api/faculty', FacultyRoute);
app.use('/api/courses', CourseRoute);
app.use('/api/rooms', ClassroomRoute);
app.use('/api/dashboard', DashboardRoute);
app.use('/api/constraints', TimetableConstraintRoute);
app.use('/api/timetable', CourseAssignmentRoute);
app.use('/api/generator', GeneratorRoute);
app.use('/api/requests', RequestRoute);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Mongo Db is connected!"))
    .catch(err => console.log("Database connection error: ", err))
app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT);
});
