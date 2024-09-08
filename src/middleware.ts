// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token'); // Assumindo que o token está salvo nos cookies

  const { pathname } = req.nextUrl;

  // Define rotas públicas, como a página de login
  const isPublicRoute = pathname === '/login' || pathname === '/api/Usuarios/authenticate';

  // Se o token não existir e a rota não for pública, redireciona para a página de login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Se o usuário estiver logado e tentar acessar a página de login, redireciona para o dashboard
  if (token && pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next(); // Continua para a rota original se todas as verificações passarem
}

export const config = {
  matcher: [
    '/dashboard', 
    '/teste', 
    '/someOtherPrivateRoute'], // Defina as rotas privadas que precisam de proteção
};
