import React from 'react';
import { Plus } from 'lucide-react';

/**
 * Propiedades del FloatingActionButton
 * @param onClick - Función que se ejecuta al hacer clic en el botón
 */
interface FABProps {
    onClick: () => void;
}

/**
 * Componente FAB (Floating Action Button)
 * Un botón circular que "flota" en la esquina inferior derecha.
 */
const FloatingActionButton: React.FC<FABProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-[#4B56D2] to-[#0051FF] text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all z-50 group"
            aria-label="Añadir nueva meta o cuenta"
        >
            {/* Icono de plus con animación de rotación al hacer hover en el botón */}
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
    );
};

export default FloatingActionButton;
