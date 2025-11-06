export const getSessionTokenHeader = (request: Request): string|undefined => {
  return request.headers.get('authorization')?.replace('Bearer ', '');
}

export const getSessionTokenFromUrlParam = (request: Request): string|undefined => {
  const searchParams = new URLSearchParams(request.url);
  return searchParams.get('id_token') ?? undefined;
}
