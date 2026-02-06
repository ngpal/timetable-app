import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
dotenv.config();
import cors from 'cors';
import AuthRoute from './routes/auth.route.js';
import FacultyRoute from './routes/faculty.route.js';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin:'http://localhost:5173',
        credentials:true
    }
));

app.use('/api/auth',AuthRoute);
app.use('/api/faculty', FacultyRoute);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongo Db is connected!"))
.catch(err=> console.log("Database connection error: ",err))
app.listen(PORT,()=>{
    console.log("Server is running on port: ",PORT);
});
