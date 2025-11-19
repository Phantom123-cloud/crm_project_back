import { UsersRepository } from "src/users/users.repository";
import { AuthService } from "./auth.service";
import { CreateSessionBuilder } from "./domain/create-session.builder";
import { AuthRepository } from "./repositories/auth.repository";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { LoginUseCase } from "./use-cases/login.usecase";
import { RegisterUseCase } from "./use-cases/register.usecase";
import { UpdateAccountCredentialsUseCase } from "./use-cases/update-account-credentials.usecase";
import { UserSessionUseCase } from "./use-cases/user-session-usecase";
import { RoleTemplatesRepository } from "src/role-templates/role-templates.repository";
import { TokenRepository } from "./repositories/token.repository";

export const providers = [
  AuthService,
  JwtStrategy,
  AuthRepository,
  RegisterUseCase,
  LoginUseCase,
  UserSessionUseCase,
  CreateSessionBuilder,
  UpdateAccountCredentialsUseCase,
  UsersRepository,
  RoleTemplatesRepository,
  TokenRepository,
];
