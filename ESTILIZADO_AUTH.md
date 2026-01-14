# Guía de Estilizado: Login y Registro (SaveTrack-Pro)

Esta guía detalla los pasos necesarios para transformar las páginas de Login y Registro de SaveTrack-Pro siguiendo la estética de la imagen de referencia: un diseño minimalista, "limpio" y con un enfoque en la usabilidad y tipografía moderna.

## 1. Análisis Visual de la Referencia

*   **Paleta de Colores:** 
    *   Fondo de página: Gris muy claro (`#F9FAFB` o similar).
    *   Fondo de tarjeta: Blanco puro (`#FFFFFF`).
    *   Acción principal (Login): Negro sólido (`#111827`).
    *   Botones sociales: Bordes finos grises con iconos centrados.
*   **Tipografía:** Fuente Sans-serif limpia (Inter u Outfit son ideales).
*   **Componentes Clave:**
    *   Header con logo e "Acme Inc.".
    *   Botones de Login con Apple y Google.
    *   Divisor con texto "Or continue with".
    *   Inputs con bordes redondeados suaves y etiquetas claras.
    *   Link de "Forgot your password?" alineado a la derecha.

---

## 2. Preparación de Iconos

Necesitarás los logos de Apple y Google. Puedes usar **Lucide React** (que ya tienes instalado) para algunos iconos, pero para Apple y Google específicos, te recomiendo usar imágenes SVG directas o componentes específicos.

> [!TIP]
> Si no tienes los SVGs, puedes usar los iconos genéricos de Lucide pero la imagen de referencia usa los logotipos oficiales.

---

## 3. Código Completo para Login (`savetrack-frontend/src/pages/Login.tsx`)

Copia y pega este código íntegro en tu archivo `Login.tsx`. Este código incluye la lógica de autenticación existente más los nuevos estilos minimalistas y el componente SVG de Google.

```tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { LogIn, Mail, Lock, Loader2, Apple } from 'lucide-react';

/**
 * Componente SVG personalizado para el logo de Google
 */
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * PÁGINA DE LOGIN
 * Implementa el diseño minimalista de referencia con integración al backend de SaveTrack Pro.
 */
const Login: React.FC = () => {
  // --- ESTADOS LOCALES ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- HOOKS ---
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Verifica si el usuario viene de una confirmación de email exitosa
  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      setIsConfirmed(true);
    }
  }, [searchParams]);

  /**
   * Manejador del envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Petición al backend al endpoint de login
      const response = await api.post('/auth/login', { email, password });

      // Extraemos el token y la info del usuario
      const { user, session } = response.data;

      // Guardamos en el contexto global y localStorage
      login(user, session.access_token);

      setSuccess(true);
      
      // Redirigimos al dashboard tras un breve delay para mostrar el éxito
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      if (err.response?.data?.message === 'Email not confirmed') {
        setError('Debes confirmar tu correo electrónico antes de iniciar sesión.');
      } else {
        setError(err.response?.data?.message || 'Error al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
      {/* HEADER: LOGO Y NOMBRE */}
      <div className="flex flex-col items-center mb-10">
        <div className="bg-black p-2.5 rounded-xl mb-4 shadow-lg">
          <div className="w-6 h-6 bg-white rounded-[4px]"></div> 
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">SaveTrack Pro</span>
      </div>

      <div className="w-full max-w-sm">
        {/* TÍTULO Y SUBTÍTULO */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-2">Login with your Apple or Google account</p>
        </div>

        {/* ALERTAS DE ESTADO */}
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-6 border border-green-100 flex items-center justify-center">
            ¡Inicio de sesión exitoso!
          </div>
        )}
        {isConfirmed && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm mb-6 border border-blue-100 flex items-center justify-center">
            ¡Correo verificado! Ya puedes entrar.
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 border border-red-100 flex items-center justify-center">
            {error}
          </div>
        )}

        {/* BOTONES SOCIALES */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          <button className="flex items-center justify-center gap-3 w-full py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm active:scale-[0.98]">
            <Apple className="w-5 h-5 fill-current" />
            <span className="text-sm font-semibold text-gray-700">Login with Apple</span>
          </button>
          <button className="flex items-center justify-center gap-3 w-full py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm active:scale-[0.98]">
            <GoogleIcon className="w-4 h-4" />
            <span className="text-sm font-semibold text-gray-700">Login with Google</span>
          </button>
        </div>

        {/* DIVISOR */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="border-t border-gray-100 w-full"></div>
          <span className="bg-[#F9FAFB] px-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest absolute">
            Or continue with
          </span>
        </div>

        {/* FORMULARIO DE LOGIN */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400 text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-900">Password</label>
              <Link to="#" className="text-xs text-gray-500 hover:text-black underline">
                Forgot your password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 active:scale-[0.99]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
          </button>
        </form>

        {/* LINK A REGISTRO */}
        <p className="text-center mt-8 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-gray-900 font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
```

---

## 4. Código Completo para Registro (`savetrack-frontend/src/pages/Register.tsx`)

Aplica la misma estética al registro para mantener la coherencia visual del sistema.

```tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { UserPlus, Mail, Lock, User, Loader2, Apple } from 'lucide-react';

/**
 * Componente SVG personalizado para el logo de Google
 */
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * PÁGINA DE REGISTRO
 * Implementa el flujo de creación de cuenta con diseño premium minimalista.
 */
const Register: React.FC = () => {
  // --- ESTADOS ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  /**
   * Manejador del submit para creación de usuario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Envío de datos al endpoint de registro
      await api.post('/auth/signup', { name, email, password });

      setSuccess(true);
      // Redirección al login tras éxito para que el usuario inicie sesión
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la cuenta. Intenta con otro correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col items-center mb-10">
        <div className="bg-black p-2.5 rounded-xl mb-4 shadow-lg">
          <div className="w-6 h-6 bg-white rounded-[4px]"></div> 
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">SaveTrack Pro</span>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create an account</h1>
          <p className="text-gray-500 text-sm mt-2">Enter your details to get started</p>
        </div>

        {/* FEEDBACK VISUAL */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 border border-red-100 flex items-center justify-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-6 border border-green-100 flex items-center justify-center">
            ¡Cuenta creada! Redirigiendo al login...
          </div>
        )}

        {/* SOCIAL AUTH */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          <button className="flex items-center justify-center gap-3 w-full py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]">
            <Apple className="w-5 h-5 fill-current" />
            <span className="text-sm font-semibold text-gray-700">Sign up with Apple</span>
          </button>
          <button className="flex items-center justify-center gap-3 w-full py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]">
            <GoogleIcon className="w-4 h-4" />
            <span className="text-sm font-semibold text-gray-700">Sign up with Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-8">
          <div className="border-t border-gray-100 w-full"></div>
          <span className="bg-[#F9FAFB] px-4 text-[11px] font-medium text-gray-400 uppercase tracking-widest absolute">
            Or continue with
          </span>
        </div>

        {/* INPUTS DE REGISTRO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com"
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all duration-200 shadow-sm disabled:opacity-50 mt-4 active:scale-[0.99]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-900 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
```

---

## 5. Configuración de Tailwind (`tailwind.config.js`)

Para que el diseño se vea idéntico, asegúrate de tener una fuente limpia configurada. En tu `tailwind.config.js`, puedes añadir:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,tsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Requiere importar Inter en index.css o HTML
      },
    },
  },
  plugins: [],
}
```

---

## Próximos Pasos Sugeridos

1.  **Instalar Inter:** Añade `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');` en tu `index.css`.
2.  **Limpiar Lucide Icons:** La referencia usa iconos muy específicos. El ícono de Apple está en Lucide, pero el de Google podrías necesitar un SVG simple.
3.  **Refinar Sombras:** Usa `shadow-sm` en la tarjeta principal para un look más moderno.
