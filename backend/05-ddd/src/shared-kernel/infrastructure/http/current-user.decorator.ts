import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

/**
 * Usage: \`@CurrentUser() user: AuthenticatedUser\` or \`@CurrentUser('userId') id: string\`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) return null;
    return data ? user[data] : user;
  },
);
