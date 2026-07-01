import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import {
  RegisterDto,
  LoginDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
} from './auth.dto';

export const authRouter = Router();

authRouter.post('/register', validate(RegisterDto), authController.register);
authRouter.post('/login', validate(LoginDto), authController.login);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.get('/me', authenticate, authController.me);
authRouter.post('/password-reset/request', validate(PasswordResetRequestDto), authController.requestPasswordReset);
authRouter.post('/password-reset/confirm', validate(PasswordResetConfirmDto), authController.confirmPasswordReset);
