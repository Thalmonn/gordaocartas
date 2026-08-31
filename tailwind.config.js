/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tcg: {
          background: '#0A0510',    // Fundo super escuro (quase preto com toque de roxo)
          surface: 'rgba(28, 15, 45, 0.7)', // Efeito de vidro em roxo profundo
          primary: '#FF6B00',       // Laranja vibrante (Ação/Preço)
          glow: '#FF8A33',          // Laranja claro para brilho
          accent: '#9D4EDD',        // Roxo elétrico (Badges/Destaques secundários)
        }
      },
      boxShadow: {
        'neon': '0 0 20px rgba(255, 107, 0, 0.4)',
        'card-hover': '0 15px 35px -5px rgba(157, 78, 221, 0.4)',
      }
    },
  },
  plugins: [],
}