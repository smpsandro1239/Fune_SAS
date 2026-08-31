import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  @ApiOperation({ summary: 'Regista uma nova agência com o primeiro utilizador administrador' })
  @ApiResponse({ status: 201, description: 'Agência e utilizador criados, tokens devolvidos.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou slug em uso.' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      exemplo: {
        value: {
          name: 'Ana Oliveira',
          email: 'admin@casahortas.com',
          password: 'Admin123!',
          agencyName: 'Funerária Casa Hortas, Lda',
          agencySlug: 'casa-hortas',
          agencyAddress: 'Rua das Maceirinhas, Cabreiros, Braga',
          agencyLocation: 'Braga',
        },
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('login')
  @ApiOperation({ summary: 'Autentica um utilizador e devolve access/refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens de acesso e atualização.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @ApiBody({
    type: LoginDto,
    examples: {
      exemplo: {
        value: {
          email: 'admin@casahortas.com',
          password: 'Admin123!',
        },
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Renova o access token usando o refresh token' })
  @ApiResponse({ status: 201, description: 'Novo access/refresh token.' })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      exemplo: {
        value: {
          refreshToken: 'jwt-refresh-token-aqui',
        },
      },
    },
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Throttle({ default: { ttl: 300_000, limit: 3 } })
  @Post('forgot-password')
  @ApiOperation({ summary: 'Inicia a recuperação de password (token enviado por email)' })
  @ApiResponse({ status: 201, description: 'Email de recuperação enviado (se a conta existir).' })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      exemplo: {
        value: {
          email: 'admin@casahortas.com',
        },
      },
    },
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle({ default: { ttl: 300_000, limit: 5 } })
  @Post('reset-password')
  @ApiOperation({ summary: 'Define uma nova password usando o token de recuperação' })
  @ApiResponse({ status: 201, description: 'Password atualizada.' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado.' })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      exemplo: {
        value: {
          token: 'token-de-recuperacao',
          newPassword: 'NovaPassword123!',
        },
      },
    },
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards()
  @Post('logout')
  @ApiOperation({ summary: 'Revoga o refresh token atual' })
  @ApiResponse({ status: 201, description: 'Refresh token revogado.' })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      exemplo: {
        value: {
          refreshToken: 'jwt-refresh-token-aqui',
        },
      },
    },
  })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiOperation({ summary: 'Devolve o perfil do utilizador autenticado com a sua agência' })
  @ApiResponse({ status: 200, description: 'Perfil do utilizador e agência.' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza o perfil do utilizador autenticado (nome, email)' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado.' })
  @ApiBody({
    type: UpdateProfileDto,
    examples: {
      exemplo: {
        value: {
          name: 'Ana Oliveira',
          email: 'ana@casahortas.com',
          phone: '+351 912 345 678',
          photoUrl: 'https://cdn.example.com/avatar.png',
          preferences: { notifications: true, theme: 'dark' },
        },
      },
    },
  })
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Altera a password do utilizador autenticado' })
  @ApiResponse({ status: 201, description: 'Password alterada.' })
  @ApiResponse({ status: 400, description: 'Password atual incorreta.' })
  @ApiBody({
    type: ChangePasswordDto,
    examples: {
      exemplo: {
        value: {
          currentPassword: 'Admin123!',
          newPassword: 'NovaPassword123!',
        },
      },
    },
  })
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }
}
