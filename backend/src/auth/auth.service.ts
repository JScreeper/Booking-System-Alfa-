import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, organizationName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if this is the first user (make them admin automatically)
    const userCount = await this.prisma.user.count();
    const isFirstUser = userCount === 0;

    // Create user and organization in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: isFirstUser ? Role.ADMIN : Role.USER,
        },
      });

      let organization;
      let organizationMember;

      if (organizationName) {
        // Create new organization
        const slug = organizationName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Check if slug already exists
        const existingOrg = await tx.organization.findUnique({
          where: { slug },
        });

        if (existingOrg) {
          throw new ConflictException('Organization with this name already exists');
        }

        organization = await tx.organization.create({
          data: {
            name: organizationName,
            slug,
          },
        });

        // Add user as OWNER of the organization
        organizationMember = await tx.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: 'OWNER',
          },
        });
      } else {
        // Add user to default organization
        const defaultOrg = await tx.organization.findUnique({
          where: { slug: 'default' },
        });

        if (!defaultOrg) {
          throw new Error('Default organization not found');
        }

        organization = defaultOrg;
        organizationMember = await tx.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: isFirstUser ? 'OWNER' : 'CLIENT',
          },
        });
      }

      return { user, organization, organizationMember };
    });

    // Generate tokens with organization
    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.user.role,
      result.organization.id,
    );

    return {
      ...tokens,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        organizationId: result.organization.id,
        organizationName: result.organization.name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      // Find user with organization memberships
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          organizationMembers: {
            where: { isActive: true },
            include: {
              organization: true,
            },
            orderBy: { createdAt: 'asc' }, // First organization is default
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Get active organization (first one or default)
      const activeMembership = user.organizationMembers[0];
      if (!activeMembership) {
        throw new UnauthorizedException('User is not a member of any organization');
      }

      const activeOrganization = activeMembership.organization;

      // Check if JWT secrets are configured
      const jwtSecret = this.configService.get('JWT_SECRET');
      const jwtRefreshSecret = this.configService.get('JWT_REFRESH_SECRET');

      if (!jwtSecret || !jwtRefreshSecret) {
        throw new Error('JWT secrets are not configured');
      }

      // Generate tokens with organization
      const tokens = await this.generateTokens(
        user.id,
        user.email,
        user.role,
        activeOrganization.id,
      );

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: activeOrganization.id,
          organizationName: activeOrganization.name,
          organizationRole: activeMembership.role,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token exists in database
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user's active organization
      const activeMembership = await this.prisma.organizationMember.findFirst({
        where: {
          userId: payload.sub,
          isActive: true,
        },
        include: { organization: true },
        orderBy: { createdAt: 'asc' },
      });

      const organizationId = activeMembership?.organization.id || payload.organizationId;

      // Generate new tokens
      const tokens = await this.generateTokens(
        payload.sub,
        payload.email,
        payload.role,
        organizationId,
      );

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    organizationId: string,
  ) {
    const jwtSecret = this.configService.get('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get('JWT_REFRESH_SECRET');

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets are not configured. Please check your .env file.');
    }

    const payload = { sub: userId, email, role, organizationId };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtRefreshSecret,
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    try {
      await this.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId,
          expiresAt,
        },
      });
    } catch (error) {
      console.error('Error saving refresh token:', error);
      // Don't fail the login if refresh token save fails
    }

    return { accessToken, refreshToken };
  }
}
