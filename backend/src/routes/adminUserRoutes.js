
import express from 'express';
import { authUser } from '../middleware/authUser.js';
import {deleteUser, editUser, getAllUsers, searchUsers} from '../controllers/adminUserController.js';
import { authAdmin } from '../middleware/authAdmin.js';


const router = express.Router();

router.get('/', authUser, authAdmin(), getAllUsers);
router.get('/search', authUser, authAdmin(), searchUsers);
router.put('/edit/:id', authUser, authAdmin(), editUser);
router.delete('/delete/:id', authUser, authAdmin(), deleteUser);

export default router;