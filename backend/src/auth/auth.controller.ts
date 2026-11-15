import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Publico } from './decorators/publico.decorator';
import { UsuarioAtual } from './decorators/usuario-atual.decorator';
import { LoginDto } from './dto/login.dto';
import type { UsuarioLogado } from './tipos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Publico()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@UsuarioAtual() usuario: UsuarioLogado) {
    await this.authService.logout(usuario.sessaoId);
  }

  @Get('me')
  me(@UsuarioAtual() usuario: UsuarioLogado) {
    return usuario;
  }
}