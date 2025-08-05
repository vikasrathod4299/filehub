import { Router } from 'express';
import { forwardRequest } from '../utils/http';
import { SERVICES } from '../config';

const router = Router();

router.all('*', async (req, res, next) => {
  try {
    const response = await forwardRequest(SERVICES.AUTH, req);
    res.status(response.status).json(response.data);
  } catch (err: any) {
    next(err.response?.data || err);
  }
});

export default router;

