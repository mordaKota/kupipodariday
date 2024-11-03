import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user, info) {
    if (!user) {
      if (info && info.message === 'Missing credentials') {
        throw new BadRequestException('Credentials are invalid');
      }
      if (err && err.status === 403) {
        throw new ForbiddenException('Authentication failed');
      }
    }
    if (!user || err) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
