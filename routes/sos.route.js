import express from 'express';

import { sendSoS ,wellNess} from '../controllers/sos.controller.js';

const router = express.Router();


router.post('/sos',sendSoS);
router.post('/wellness',wellNess);

export default router;

