import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mhd-aviso-mobile-visto';

export function AvisoMobile() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Só mostra em telas mobile (largura < 768px) e se ainda não foi dispensado
    const isMobile = window.innerWidth < 768;
    const jaViu = localStorage.getItem(STORAGE_KEY);
    if (isMobile && !jaViu) {
      // Pequeno delay para não piscar na montagem
      const t = setTimeout(() => setVisivel(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  function dispensar() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pt-2 pointer-events-none"
      style={{ animation: 'slideUpFade 0.35s ease-out both' }}
    >
      <div
        className="pointer-events-auto w-full max-w-sm mx-auto rounded-2xl border border-amber-500/40 bg-surface-2/95 backdrop-blur-md shadow-2xl p-4 flex gap-3 items-start"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(245,158,11,0.15)' }}
      >
        {/* Ícone */}
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg mt-0.5">
          ⚠️
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-amber-400 font-black text-sm leading-tight mb-1">
            Site otimizado para computadores
          </p>
          <p className="text-white/55 text-xs leading-relaxed">
            A visualização e o uso no celular podem ser limitados. Para a melhor experiência, acesse pelo computador.
          </p>
        </div>

        {/* Botão fechar */}
        <button
          onClick={dispensar}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-surface-4 transition-colors text-base leading-none mt-0.5"
          aria-label="Fechar aviso"
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
