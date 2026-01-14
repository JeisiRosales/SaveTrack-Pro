# Guía de Corrección: Errores de Autenticación y Verificación

Esta guía detalla los pasos necesarios para corregir el redireccionamiento incorrecto y permitir que solo los usuarios con correo verificado puedan iniciar sesión.

## 1. Configuración en el Dashboard de Supabase

Para que la validación de correo sea obligatoria y el link redirija correctamente, debes ajustar la configuración en tu proyecto de Supabase:

### A. Hacer obligatoria la confirmación de correo
1. Ve a **Authentication** > **Settings**.
2. En la sección **Auth Providers**, busca **Email**.
3. Asegúrate de que la opción **Confirm email** esté **activada (ON)**. 
   > [!IMPORTANT]
   > Si esta opción está apagada, Supabase permitirá el inicio de sesión inmediatamente después del registro, ignorando el correo de verificación.

### B. Configurar las URLs de redireccionamiento
1. En la misma pantalla de **Settings**, ve a **URL Configuration**.
2. **Site URL**: Cambia `http://localhost:5173` por la URL real de tu aplicación si ya está desplegada (ej. `https://tu-app.vercel.app`). Si estás en desarrollo, déjalo en localhost.
3. **Redirect URLs**: Añade explícitamente la URL completa de login:
   - `http://localhost:5173/login?confirmed=true` (para desarrollo local).
   - `https://tu-app-url.com/login?confirmed=true` (para producción).

---

## 2. Configuración en el Backend (Archivo .env)

El código del backend utiliza una variable de entorno llamada `FRONTEND_URL` para construir el link de redirección.

1. Abre el archivo `savetrack-backend/.env`.
2. Busca o añade la variable `FRONTEND_URL`.
3. Asegúrate de que apunte a la URL correcta de tu frontend (sin la barra final):
   ```env
   # Ejemplo local
   FRONTEND_URL=http://localhost:5173
   
   # Ejemplo producción
   # FRONTEND_URL=https://tu-proyecto-frontend.vercel.app
   ```

---

## 3. Manejo de Errores en el Frontend

Si un usuario intenta iniciar sesión sin haber confirmado su correo, el backend devolverá un error. Puedes mejorar la experiencia en `Login.tsx` capturando ese error específico:

```typescript
// En Login.tsx, dentro del catch:
} catch (err: any) {
    if (err.response?.data?.message === 'Email not confirmed') {
        setError('Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
    } else {
        setError(err.response?.data?.message || 'Error al iniciar sesión.');
    }
}
```

---

## ¿Por qué pasaba esto?

1. **Redirección a localhost**: El código en `auth.service.ts` tiene un "fallback" a `http://localhost:5173`. Si la variable `FRONTEND_URL` no está definida en el `.env` de producción o en el servidor donde corre el backend, siempre usará localhost.
2. **Login sin confirmar**: Por defecto, Supabase crea la sesión inmediatamente a menos que se active explícitamente la casilla "Confirm email" en su panel de control.
