# SaveTrack Pro: Administrador de metas financieras.

**SaveTrack Pro** es una aplicación web inteligente para la gestión de metas de ahorro que combina un backend robusto con NestJS y un frontend moderno en React. Utiliza algoritmos de tiempo y progreso real para calcular el estado de tus metas financieras (adelantado, al día, atrasado), proyectar cuotas requeridas, y gestionar transacciones entre cuentas con total seguridad mediante Supabase Auth y Row Level Security (RLS).

## Documentación por Módulo

Este proyecto está dividido en dos partes principales, cada una con su propia documentación detallada:

- **[Backend (NestJS)](./savetrack-backend/README.md):** Contiene la lógica de negocio, integración con Supabase (Auth, RLS, Storage), y cálculos de métricas. Revisa su README para instrucciones de configuración y despliegue del servidor.
- **[Frontend (React + Vite)](./savetrack-frontend/README.md):** Interfaz de usuario responsiva y moderna. Consulta su README para detalles sobre el diseño, hooks personalizados y cómo conectar con el backend.

## Stack Tecnológico

### Frontend
- **Framework:** [React](https://react.dev/) 19.2.0 + [TypeScript](https://www.typescriptlang.org/) 5.9.3
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) 4.1.18 + CSS Variables
- **Routing:** [React Router DOM](https://reactrouter.com/) 7.12.0
- **HTTP Client:** [Axios](https://axios-http.com/) 1.13.2 con interceptors
- **State Management:** React Context API
- **Gráficos:** [Recharts](https://recharts.org/) 3.6.0
- **Iconos:** [Lucide React](https://lucide.dev/) 0.562.0

### Backend
- **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) vía [Supabase](https://supabase.com/)
- **Autenticación:** Supabase Auth + Passport JWT
- **Validación:** Class-validator y Class-transformer

### Infraestructura
- **Despliegue:** [Vercel](https://vercel.com/)
- **Seguridad:** Row Level Security (RLS) en PostgreSQL

## Características Principales

- **Sistema de Autenticación Completo:** Login, registro, recuperación de contraseña y verificación de email mediante Supabase Auth con JWT y refresh tokens automáticos.
- **Dashboard Financiero Interactivo:** Resumen de balance total consolidado, visualización de cuentas con distribución porcentual, estado de metas de ahorro y transacciones recientes.
- **Gestión Inteligente de Metas de Ahorro:**
  - Creación y edición de objetivos financieros con nombre, descripción, monto objetivo y frecuencia.
  - Cálculo automático de estado (adelantado, al día, atrasado) comparando progreso real vs. esperado.
  - Proyección de cuotas diarias, semanales y mensuales requeridas para alcanzar la meta a tiempo.
  - Historial completo de transacciones por meta con gráficos de progreso temporal.
- **Cuentas Financieras:** CRUD completo de cuentas bancarias, transferencias entre cuentas con validación de fondos y actualización automática de balances.
- **Transacciones Automáticas:** Historial unificado de depósitos y retiros con filtros avanzados, estadísticas visuales y exportación a CSV.
- **Seguridad Robusta:** Row Level Security (RLS) en PostgreSQL garantizando que cada usuario solo acceda a sus propios datos.
- **Diseño Premium:** Interfaz responsiva con animaciones suaves, modo oscuro/claro y sistema de diseño consistente basado en Tailwind CSS.

## Ventajas Destacables

- **Algoritmos Inteligentes de Salud Financiera:** Calcula automáticamente si estás adelantado, al día o atrasado en tus metas basándose en el tiempo transcurrido y el progreso esperado.
- **Gestión Centralizada:** Administra múltiples cuentas financieras y metas de ahorro desde una única plataforma.
- **Seguridad a Nivel de Base de Datos:** Políticas RLS en PostgreSQL aseguran aislamiento total de datos entre usuarios.
- **Sincronización en Tiempo Real:** Los cambios en transacciones actualizan instantáneamente los balances de cuentas y el progreso de metas.
- **Experiencia de Usuario Premium:** Interfaz moderna y responsiva que funciona perfectamente en dispositivos móviles, tablets y escritorio.
- **Exportación de Datos:** Descarga tu historial de transacciones en formato CSV para análisis externos.
- **Auto-refresh de Tokens:** No necesitas volver a iniciar sesión; los tokens JWT se renuevan automáticamente.

## Arquitectura de Datos (ERD)

El sistema utiliza un modelo relacional sólido para garantizar la integridad de las transacciones entre las cuentas globales y las metas individuales:

1. **Profiles:** Usuarios centralizados con trigger automático al registrarse.
2. **Funding Accounts:** Fuentes de capital (cuentas bancarias/ahorros).
3. **Savings Goals:** Entidad principal de ahorro con tracking de progreso.
4. **Transactions:** Historial de movimientos financieros vinculados a cuentas y metas.

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/JeisiRosales/SaveTrack-Pro.git
cd SaveTrack-Pro
```

### 2. Configurar Backend (NestJS)

```bash
cd savetrack-backend
npm install
```

Crear archivo `.env` en la raíz de `savetrack-backend`:
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
JWT_SECRET=tu_secreto_jwt_personalizado
```

Ejecutar el servidor:
```bash
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

### 3. Configurar Frontend (React + Vite)

```bash
cd ../savetrack-frontend
npm install
```

Crear archivo `.env` en la raíz de `savetrack-frontend`:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
VITE_API_URL=http://localhost:3000
# Para producción usar:
# VITE_API_URL=https://savetrack-backend.vercel.app
```

Ejecutar la aplicación:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 4. Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta las migraciones SQL necesarias para crear las tablas (consulta el README del backend)
3. Configura las políticas de Row Level Security (RLS)
4. Crea un bucket llamado `goal-images` en Supabase Storage para las imágenes de metas

## Desarrollado por Jeisi Rosales.

Si tienes alguna duda sobre este proyecto o quieres conectar conmigo, puedes encontrarme en:

* **LinkedIn:** [Jeisi Rosales](www.linkedin.com/in/jeisi-rosales)
* **Email:** [Enviame un correo por Gmail](mailto:jeisirosales2003@gmail.com&su=I%20would%20like%20to%20work%20with%20you&body=Hi%20Jeisi,)

---
 
**Importante:** Este proyecto fue desarrollado con el objetivo de gestionar y optimizar metas de ahorro personales, ajustándose rigurosamente a mis requerimientos específicos. 
