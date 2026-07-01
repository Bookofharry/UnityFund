import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

const transporter = createTransporter();

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  if (!transporter) {
    logger.info({ to, subject }, '[EMAIL DEV] SMTP not configured — logging email');
    logger.info({ text }, '[EMAIL DEV] body');
    return;
  }
  await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html, text });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  try {
    await send(
      to,
      'Reset your UnityFund password',
      `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link expires in ${env.PASSWORD_RESET_EXPIRES_HOURS} hour(s).</p>`,
      `Reset your password: ${resetUrl}  (expires in ${env.PASSWORD_RESET_EXPIRES_HOURS} hour(s))`,
    );
  } catch (err) {
    logger.warn({ err, to }, 'Failed to send password reset email');
  }
}

export async function sendInvitationEmail(
  to: string,
  inviteUrl: string,
  orgName: string,
): Promise<void> {
  try {
    await send(
      to,
      `You've been invited to join ${orgName} on UnityFund`,
      `<p>You have been invited to join <strong>${orgName}</strong> on UnityFund.</p><p><a href="${inviteUrl}">Accept Invitation</a></p><p>This invitation expires in ${env.INVITATION_EXPIRES_HOURS} hours.</p>`,
      `Accept your invitation to ${orgName}: ${inviteUrl}`,
    );
  } catch (err) {
    logger.warn({ err, to }, 'Failed to send invitation email');
  }
}
