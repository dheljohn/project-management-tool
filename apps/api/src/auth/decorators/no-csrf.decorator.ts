import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiExtension } from '@nestjs/swagger';
import { SkipCsrf } from './skip-csrf.decorator';

export function NoCsrf() {
  return applyDecorators(
    SkipCsrf(),
    ApiOperation({
      description: '🔓 No CSRF protection required for this route.',
    }),
    ApiExtension('x-csrf-exempt', true),
  );
}
