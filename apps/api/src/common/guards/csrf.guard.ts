import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>('skipCsrf', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.includes(req.method)) return true;

    const cookieToken = req.cookies?.['csrf_token'];
    const headerToken = req.headers['x-csrf-token'];

    // const cookieToken =
    //   typeof req.cookies?.['csrf_token'] === 'string'
    //     ? req.cookies['csrf_token']
    //     : undefined;
    // const headerValue = req.headers['x-csrf-token'];
    // const headerToken =
    //   typeof headerValue === 'string'
    //     ? headerValue
    //     : Array.isArray(headerValue)
    //       ? headerValue[0]
    //       : undefined;
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }
    return true;
  }
}
