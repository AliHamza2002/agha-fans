import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
var router = express.Router();

/* POST register user */
router.post('/register', registerUser);

/* POST login user */
router.post('/login', loginUser);

export default router;
