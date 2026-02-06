import express from  'express';
import { verifyAdmin } from '../utils/verifyUser.js';
import { login } from '../controller/auth.controller.js';

const router = express.Router();

router.post('/login', login);

router.post('/edit', verifyAdmin, (req, res) => {
  res.json("Timetable updated successfully");
});

export default router;



