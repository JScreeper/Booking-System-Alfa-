import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      
      this.logger.warn(`Authentication failed for ${request.method} ${request.url}`);
      this.logger.debug(`Auth header present: ${!!authHeader}`);
      this.logger.debug(`Error: ${err?.message || 'No error'}`);
      this.logger.debug(`Info: ${info?.message || 'No info'}`);
      
      // If token expired, throw UnauthorizedException with 401 status
      if (info?.message === 'jwt expired' || info?.message?.includes('expired')) {
        throw new UnauthorizedException('Token expired');
      }
      
      throw err || new Error(info?.message || 'Unauthorized');
    }
    return user;
  }
}
