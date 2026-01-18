# SaveTrack Pro - Frontend (React + TypeScript)

Este es el frontend de **SaveTrack Pro**, una aplicación inteligente para la gestión de metas de ahorro. Está construido con **React**, **TypeScript** y utiliza **Supabase** para autenticación y **Axios** para comunicación con el backend de NestJS.

## Características Principales

- **Sistema de Autenticación:** Login, registro, recuperación de contraseña y verificación de email mediante Supabase Auth.
- **Dashboard Interactivo:** Resumen de balance total, visualización de cuentas con distribución porcentual y estado de metas de ahorro.
- **Gestión de Metas de Ahorro:** Creación, edición y seguimiento de objetivos financieros con cálculo automático de estado (adelantado, al día, atrasado).
- **Cuentas Financieras:** CRUD completo de cuentas, transferencias entre cuentas con validación de fondos.
- **Historial de Transacciones:** Vista unificada con filtros avanzados, estadísticas visuales y exportación a CSV.
- **Diseño Premium:** Interfaz responsiva con animaciones suaves, modo oscuro/claro y sistema de diseño consistente.

## Stack Tecnológico

- **Framework:** [React](https://react.dev/) 19.2.0 + [TypeScript](https://www.typescriptlang.org/) 5.9.3
- **Build Tool:** [Vite](https://vitejs.dev/) (Desarrollo ultra-rápido)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) 4.1.18 + CSS Variables personalizadas
- **Routing:** [React Router DOM](https://reactrouter.com/) 7.12.0
- **Autenticación:** [Supabase](https://supabase.com/) Auth (JWT + Refresh Tokens)
- **HTTP Client:** [Axios](https://axios-http.com/) 1.13.2 con interceptors
- **State Management:** React Context API
- **Gráficos:** [Recharts](https://recharts.org/) 3.6.0
- **Iconos:** [Lucide React](https://lucide.dev/) 0.562.0

## Seguridad y Autenticación

### Supabase Auth & JWT
El sistema utiliza el mecanismo de autenticación de Supabase integrado con el backend NestJS. El frontend gestiona las sesiones mediante `AuthContext.tsx`, que:
- Inicializa automáticamente la sesión al cargar la aplicación.
- Escucha cambios de estado (login/logout) y sincroniza con localStorage.
- Auto-refresca los tokens JWT expirados mediante Supabase.

### Interceptor Axios
Todas las peticiones HTTP incluyen automáticamente el token JWT en el header `Authorization: Bearer <token>`. El interceptor en `api.ts`:
1. Obtiene el token actual de Supabase (con auto-refresh).
2. Si no existe, utiliza fallback a localStorage.
3. Adjunta el token a cada request al backend.

## Estructura del Proyecto

- `src/pages`: Páginas principales (Dashboard, Goals, Accounts, Transactions, Login, Register).
- `src/components/layout`: Componentes de estructura (Sidebar).
- `src/components/modals`: Modales para crear/editar metas, cuentas y transacciones.
- `src/components/ui`: Componentes reutilizables (Botones, Dropdowns).
- `src/context`: AuthContext para gestión global de autenticación.
- `src/lib`: Cliente Axios configurado con interceptors y Supabase client.

## Instalación y Uso

1. Clonar el repositorio.
2. Configurar el archivo `.env` con las credenciales de Supabase y URL del backend:
   ```env
   VITE_SUPABASE_URL=tu_url
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   VITE_API_URL=https://savetrack-backend.vercel.app
   # O para desarrollo local:
   # VITE_API_URL=http://localhost:3000
   ```
3. Instalar dependencias: `npm install`
4. Ejecutar en modo desarrollo: `npm run dev`
5. La aplicación estará disponible en `http://localhost:5173`