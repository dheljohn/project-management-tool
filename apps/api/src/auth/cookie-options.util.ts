export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  };
}
