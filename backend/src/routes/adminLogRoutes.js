import express from 'express';
import { getCheckoutLogs, exportCheckoutLogsCSV } from '../controllers/adminLogController.js';
import { authUser } from '../middleware/authUser.js';
import { authAdmin } from '../middleware/authAdmin.js';

const router = express.Router();

router.get('/', authUser, authAdmin(), getCheckoutLogs);
router.get("/export", authUser, authAdmin(), exportCheckoutLogsCSV)

export default router;
