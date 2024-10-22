import express from 'express';

import { signup,login,getUser } from '../controllers/auth.controller.js';

const router = express.Router();


router.post('/signup',signup);
router.post('/login',login);
router.post('/user',getUser);

export default router;

