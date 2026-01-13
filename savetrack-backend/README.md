# SaveTrack Pro - Backend (NestJS)

Este es el backend de **SaveTrack Pro**, una aplicación inteligente para la gestión de metas de ahorro. Está construido con **NestJS** y utiliza **Supabase** como infraestructura principal (Base de Datos, Autenticación y Almacenamiento).

## 🚀 Características Principales

- **Gestión de Metas de Ahorro:** Creación, actualización (DTOs parciales) y seguimiento de objetivos financieros.
- **Cuentas de Financiamiento:** Gestión de las fuentes de dinero (ahorros, corriente, etc.).
- **Transacciones Automáticas:** Historial de depósitos y retiros que actualizan automáticamente los balances de las cuentas y el progreso de las metas.
- **Cálculo de Salud Financiera:** Algoritmos internos que comparan el progreso real vs. esperado según las fechas límite.
- **Sistema de Archivos:** Subida de imágenes para metas con asociación automática a la base de datos.

## 🛠️ Stack Tecnológico

- **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
- **Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Autenticación:** Supabase Auth + Passport JWT (NestJS)
- **Almacenamiento:** Supabase Storage (Bucket: `goal-images`)
- **Validación:** Class-validator y Class-transformer

## 🔐 Seguridad y Autenticación

### Supabase Auth & JWT
El sistema utiliza el mecanismo de autenticación de Supabase. El backend de NestJS está protegido mediante el decorador `@UseGuards(AuthGuard('jwt'))`, lo que asegura que solo usuarios autenticados con un token válido puedan acceder a sus datos.

### Row Level Security (RLS)
La seguridad está reforzada en la capa de base de datos mediante políticas **RLS** en PostgreSQL:
- Cada usuario solo puede ver y modificar sus propios perfiles, metas y cuentas.
- Se utiliza un **Trigger** en Supabase para crear automáticamente el perfil del usuario en la tabla `profiles` tras el registro en `auth.users`.

## 📂 Estructura del Proyecto

- `src/auth`: Manejo de registro y login integrando Supabase.
- `src/funding-accounts`: Gestión de cuentas bancarias/fuentes de dinero.
- `src/savings-goals`: Corazón del proyecto, maneja las metas y su lógica de salud.
- `src/transactions`: Lógica para mover dinero entre cuentas y metas.
- `src/supabase`: Módulo global para la conexión con el cliente de Supabase.

## 📸 Gestión de Imágenes

El backend incluye un flujo optimizado para imágenes:
1. El archivo se sube al Bucket `goal-images`.
2. Se genera una URL pública.
3. El servidor actualiza automáticamente el campo `image_url` en la tabla `savings_goals` asociado al ID proporcionado.

## 📝 Instalación y Uso

1. Clonar el repositorio.
2. Configurar el archivo `.env` con las credenciales de Supabase:
   ```env
   SUPABASE_URL=tu_url
   SUPABASE_ANON_KEY=tu_anon_key
   JWT_SECRET=tu_secreto
   ```
3. Instalar dependencias: `npm install`
4. Ejecutar en modo desarrollo: `npm run start:dev`

## 📊 Métricas de Salud
El `SavingsGoalsService` incluye lógica para calcular:
- % de salud (Progreso real vs. esperado).
- Cuotas diarias/semanales/mensuales requeridas para alcanzar la meta a tiempo.
