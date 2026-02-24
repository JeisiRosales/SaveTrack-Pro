# SaveTrack Pro - Backend (NestJS)

Este es el backend de **SaveTrack Pro**, una plataforma robusta para la gestión inteligente de finanzas personales y metas de ahorro. Construido bajo una arquitectura modular con **NestJS**, integra **Supabase** para ofrecer una infraestructura segura de base de datos, autenticación y almacenamiento.

## Propósito y Funcionalidad

El backend actúa como el núcleo lógico de SaveTrack Pro, ofreciendo una API REST modular que facilita:
- **Gestión de Liquidez:** Control total sobre cuentas de financiamiento y balances.
- **Planificación de Metas:** Definición de objetivos de ahorro con seguimiento de progreso en tiempo real.
- **Automatización Financiera:** Registro de transacciones que impactan automáticamente los balances de cuentas y el cumplimiento de metas.
- **Análisis de Salud:** Algoritmos que determinan si el ritmo de ahorro es suficiente para alcanzar una meta en la fecha establecida.
- **Dashboard Holístico:** Generación de reportes detallados y estadísticas para una visión clara de la situación financiera.

## Estructura del Proyecto

El proyecto sigue el estándar de NestJS, organizando la lógica por módulos funcionales dentro de `src/`:

### Módulos Principales
| Módulo | Función |
| :--- | :--- |
| `auth` | Gestión de identidad y sesiones mediante Supabase Auth y JWT. |
| `users` | Manejo de perfiles de usuario y metadatos básicos. |
| `user-settings` | Configuraciones personalizadas (moneda, preferencias de UI, etc.). |
| `funding-accounts` | Gestión de las fuentes de dinero (Cuentas bancarias, efectivo, tarjetas). |
| `savings-goals` | El motor del sistema; gestiona metas, plazos y cálculos de salud. |
| `transactions` | Registro de depósitos y retiros vinculados directamente a metas. |
| `income-categories` | Clasificación para fuentes de ingresos (Salario, Inversiones, etc.). |
| `expense-categories` | Clasificación para tipos de gastos (Renta, Comida, Entretenimiento). |
| `income-transactions` | Registro detallado de entradas de dinero. |
| `expense-transactions` | Registro detallado de salidas de dinero. |
| `reports` | Motor de reportes; genera estadísticas de dashboard, comparativas mensuales y balances. |
| `supabase` | Módulo de infraestructura para la conexión global con el cliente Supabase. |

### Organización Interna de Módulos
Cada módulo suele contener:
- `*.controller.ts`: Define los endpoints de la API (REST).
- `*.service.ts`: Implementa la lógica de negocio y comunicación con Supabase.
- `dto/`: Objetos de transferencia de datos para validación (class-validator).
- `entities/`: Definición de tipos o clases que representan el modelo de datos.

## Flujo de Datos y Arquitectura

1. **Autenticación**: El cliente envía un JWT de Supabase. El `AuthGuard('jwt')` valida el token antes de permitir el acceso a los controladores.
2. **Ciclo de Vida de una Transacción**:
   - Una petición llega a `TransactionsController`.
   - El `TransactionsService` procesa la lógica: descuenta saldo de una `FundingAccount` y lo suma al progreso de una `SavingsGoal`.
   - La base de datos en Supabase asegura la integridad mediante políticas RLS y triggers automáticos.
3. **Cálculo de Salud**: Al consultar una meta, el `SavingsGoalsService` calcula dinámicamente el progreso esperado vs. el real, proporcionando alertas si el usuario está atrasado.

## Stack Tecnológico

- **Core:** [NestJS](https://nestjs.com/) (Framework de Node.js progresivo).
- **Lenguaje:** TypeScript.
- **Backend-as-a-Service:** [Supabase](https://supabase.com/).
  - **DB:** PostgreSQL con Row Level Security (RLS).
  - **Storage:** Manejo de imágenes para las metas de ahorro.
- **Seguridad:** Passport JWT + Supabase Auth.
- **Validación:** `class-validator` y `class-transformer`.

## Instalación y Configuración

1. **Clonar el repositorio.**
2. **Configurar el entorno:**
   Crea un archivo `.env` basado en el siguiente ejemplo:
   ```env
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_anon_key_publica
   SUPABASE_SERVICE_KEY=tu_service_key_privada
   JWT_SECRET=tu_secreto_para_validar_tokens
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```
3. **Instalar dependencias:**
   ```bash
   npm install
   ```
4. **Ejecutar el servidor:**
   ```bash
   # Modo desarrollo
   npm run start:dev
   
   # Modo producción
   npm run build
   npm run start:prod
   ```