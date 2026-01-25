import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = configService.get('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      this.logger.warn('Invalid JWT payload: missing sub');
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      if (!user) {
        this.logger.warn(`User not found for ID: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }

      // Get organization from payload or find user's active organization
      let organizationId = payload.organizationId;
      
      if (!organizationId) {
        // Fallback: get first active organization
        const membership = await this.prisma.organizationMember.findFirst({
          where: {
            userId: payload.sub,
            isActive: true,
          },
          orderBy: { createdAt: 'asc' },
        });
        
        if (membership) {
          organizationId = membership.organizationId;
        }
      }

      // Verify user has access to this organization
      if (organizationId) {
        const membership = await this.prisma.organizationMember.findUnique({
          where: {
            userId_organizationId: {
              userId: payload.sub,
              organizationId,
            },
          },
        });

        if (!membership || !membership.isActive) {
          this.logger.warn(`User ${payload.sub} does not have access to organization ${organizationId}`);
          throw new UnauthorizedException('User does not have access to this organization');
        }
      }

      return {
        ...user,
        organizationId,
      };
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
