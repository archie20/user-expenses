import express from 'express';
import * as admin from '../controllers/admin/controller';
import * as staff from '../controllers/staff/controller';

const router = express.Router();

router.post('/admin/login',admin.login);
router.post('/admin/create',admin.createAdmin);


router.post('/staff',staff.createStaff);
router.get('/staff', staff.getAllStaff);
router.get('/staff/:num', staff.getStaff);

router.post('/staff/login',staff.login);

router.post('/staff/expense',staff.saveExpense);
router.get('/staff/:num/expense',staff.getAllExpenses);


export = router;