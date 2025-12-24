// backend/src/routes/adminNotificationRoutes.js
import { Router } from 'express';
import { authAdmin } from '../middleware/authAdmin.js';
import { authUser }  from '../middleware/authUser.js';
import { getNotifications }   from '../controllers/adminNotificationController.js';

const router = Router();
router.get('/', authUser, authAdmin(), getNotifications);
export default router;
