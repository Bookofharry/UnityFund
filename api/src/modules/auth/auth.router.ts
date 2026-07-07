import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import {
  RegisterDto,
  LoginDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
  RefreshTokenDto,
  LogoutDto,
} from './auth.dto';

export const authRouter = Router();

authRouter.post('/register', validate(RegisterDto), authController.register);
authRouter.post('/login', validate(LoginDto), authController.login);
// No `authenticate` — the whole point is this works when the access token
// has already expired. The refresh token itself is the credential.
authRouter.post('/refresh', validate(RefreshTokenDto), authController.refresh);
authRouter.post('/logout', validate(LogoutDto), authController.logout);
authRouter.get('/me', authenticate, authController.me);
authRouter.post('/password-reset/request', validate(PasswordResetRequestDto), authController.requestPasswordReset);
authRouter.post('/password-reset/confirm', validate(PasswordResetConfirmDto), authController.confirmPasswordReset);
