import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
import cors from 'cors';
import AuthRoute from './routes/auth.route.js';


const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cors(
    {
        origin:'http://localhost:5173',
        credentials:true
    }
));

app.use('/api/auth',AuthRoute);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongo Db is connected!"))
.catch(err=> console.log("Database connection error: ",err))
app.listen(PORT,()=>{
    console.log("Server is running on port: ",PORT);
});
