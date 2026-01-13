# SaveTrack Pro: Financial Goal Orchestrator

**SaveTrack Pro** es una plataforma integral de gestión financiera diseñada para transformar metas de ahorro en planes de acción ejecutables. A diferencia de un rastreador común, utiliza algoritmos de tiempo y progreso real para calcular cuotas dinámicas y salud financiera.

## Documentación por Módulo

Este proyecto está dividido en dos partes principales, cada una con su propia documentación detallada:

- **[Backend (NestJS)](./savetrack-backend/README.md):** Contiene la lógica de negocio, integración con Supabase (Auth, RLS, Storage), y cálculos de métricas. Revisa su README para instrucciones de configuración y despliegue del servidor.
- **[Frontend (React + Vite)](./savetrack-frontend/README.md):** Interfaz de usuario responsiva y moderna. Consulta su README para detalles sobre el diseño, hooks personalizados y cómo conectar con el backend.

## Stack Tecnológico

- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) (TypeScript)
- **Backend:** [NestJS](https://nestjs.com/) (Arquitectura Modular)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) (vía [Supabase](https://supabase.com/))
- **Autenticación:** Supabase Auth
- **Almacenamiento:** Supabase Storage (para imágenes de metas)
- **Despliegue:** [Vercel](https://vercel.com/)

## Características Principales

- **Gestión de Metas:** Creación de objetivos con tracking de monto inicial, actual y objetivo.
- **Análisis de Progreso Inteligente:**
  - Cálculo de semanas transcurridas vs. restantes.
  - Proyección de "Monto Esperado" vs. "Monto Real".
  - Desglose de cuotas necesarias: diarias, semanales y mensuales.
- **Cuentas Globales:** Sistema de cuentas de origen (corriente, ahorros) con transacciones atómicas.
- **Visualización:** Barras de porcentaje dinámicas y feedback visual según el estado de la meta.
- **Evidencia Visual:** Carga de imágenes para personalizar cada objetivo de ahorro.

## Arquitectura de Datos (ERD)

El sistema utiliza un modelo relacional sólido para garantizar la integridad de las transacciones entre las cuentas globales y las metas individuales:

1. **Profiles:** Usuarios centralizados.
2. **Funding Accounts:** Fuentes de capital.
3. **Savings Goals:** Entidad principal de ahorro.
4. **Transactions:** Historial de movimientos financieros vinculados.

## Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/JeisiRosales/SaveTrack-Pro.git
   ```

## Desarrollado por Jeisi Rosales.

Si tienes alguna duda sobre este proyecto o quieres conectar conmigo, puedes encontrarme en:

* **LinkedIn:** [Jeisi Rosales](www.linkedin.com/in/jeisi-rosales)
* **Email:** [Enviame un correo por Gmail](https://mail.google.com/mail/?view=cm&fs=1&to=jeisirosales2003@gmail.com&su=I%20would%20like%20to%20work%20with%20you&body=Hi%20Jeisi,)

---
 
**Importante:** Este proyecto fue desarrollado con el objetivo de gestionar y optimizar mis metas de ahorro personales, ajustándose rigurosamente a mis requerimientos específicos. 