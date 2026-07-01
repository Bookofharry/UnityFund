declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        id: string;
        email: string;
      };
      orgMembership?: {
        id: string;
        role: import('@prisma/client').OrgMemberRole;
        status: import('@prisma/client').OrgMemberStatus;
        organizationId: string;
        userId: string;
      };
      rawBody?: Buffer;
    }
  }
}

export {};
