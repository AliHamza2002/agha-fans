import express from 'express';
import { registerUser } from '../controllers/userController.js';
var router = express.Router();

/* GET users listing. */
router.post('/register', registerUser);

export default router;
