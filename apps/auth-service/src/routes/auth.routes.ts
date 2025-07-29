import express from 'express';
import AuthController from '../controllers/auth';

const router = express.Router();

router.post('/sign-up', AuthController.signUp);
router.post('/sign-in', AuthController.signIn);
router.post('/refresh-token', AuthController.refreshAccessToken);
router.post('/sign-out', AuthController.signOut);

export default router;
