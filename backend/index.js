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
import SlotChangeRequestRoute from './routes/slotChangeRequest.route.js';
import GeneratorRoute from './routes/generator.route.js';
import RequestRoute from './routes/request.route.js';
import StudentRoute from './routes/student.route.js';

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

// Health check endpoint (used by Elastic Beanstalk for instance monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Root dashboard
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Timetable App - Backend</title>
            <style>
                body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f1f5f9; }
                .card { text-align: center; padding: 3rem; border-radius: 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
                h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; background: #22c55e; color: #fff; font-size: 0.875rem; font-weight: 600; }
                p { color: #94a3b8; margin-top: 1rem; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🎓 Timetable App Backend</h1>
                <span class="badge">✓ Running</span>
                <p>API is live and healthy</p>
                <p style="font-size:0.8rem;">Uptime: ${Math.floor(process.uptime())}s | <a href="/health" style="color:#60a5fa;">Health Check</a> | <a href="/api-docs" style="color:#60a5fa;">API Docs</a></p>
            </div>
        </body>
        </html>
    `);
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', AuthRoute);
app.use('/api/faculty', FacultyRoute);
app.use('/api/courses', CourseRoute);
app.use('/api/rooms', ClassroomRoute);
app.use('/api/dashboard', DashboardRoute);
app.use('/api/constraints', TimetableConstraintRoute);
app.use("/api/timetable", CourseAssignmentRoute);
app.use('/api/slot-change-requests', SlotChangeRequestRoute);
app.use('/api/generator', GeneratorRoute);
app.use('/api/requests', RequestRoute);
app.use('/api/student', StudentRoute);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Mongo Db is connected!"))
    .catch(err => console.log("Database connection error: ", err))
app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT);
});
