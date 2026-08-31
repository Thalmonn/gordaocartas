function App() {
  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-tcg-primary selection:text-white">
      
      {/* Cabeçalho Glassmorphism */}
      <header className="fixed w-full top-0 z-50 bg-tcg-background/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter text-white">
          GORDÃO <span className="text-transparent bg-clip-text bg-gradient-to-r from-tcg-primary to-orange-400">CARTAS</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white hover:text-tcg-accent transition">Início</a>
          <a href="#" className="hover:text-white hover:text-tcg-accent transition">Cartas Avulsas</a>
          <a href="#" className="hover:text-white hover:text-tcg-accent transition">Decks & Selados</a>
          <a href="#" className="hover:text-white hover:text-tcg-accent transition">Acessórios</a>
        </nav>
      </header>

      {/* Área Principal (Hero Section) */}
      <main className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
        
        {/* Textos e Chamada para Ação */}
        <div className="flex-1 space-y-6 z-10 text-center md:text-left">
          <div className="inline-block px-3 py-1 rounded-full bg-tcg-accent/20 border border-tcg-accent/40 text-purple-300 text-xs font-bold tracking-wide uppercase shadow-[0_0_10px_rgba(157,78,221,0.2)]">
            ✨ Estoque Atualizado
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
            O arsenal completo para o seu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-tcg-accent to-purple-400">próximo duelo.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto md:mx-0">
            Cartas avulsas, decks competitivos, produtos selados e acessórios premium. Tudo o que você precisa para jogar e colecionar, direto do Gordão para a sua mesa.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button className="bg-tcg-primary hover:bg-tcg-glow hover:shadow-neon text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
              Ver Catálogo Completo
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300">
              Explorar Acessórios
            </button>
          </div>
        </div>

        {/* Card de Demonstração (Versátil para qualquer produto) */}
        <div className="flex-1 w-full max-w-sm relative z-10 group mt-8 md:mt-0">
          {/* Luz de fundo do card (Glow Roxo) */}
          <div className="absolute inset-0 bg-tcg-accent/20 blur-[50px] rounded-full group-hover:bg-tcg-accent/30 transition duration-500"></div>

          {/* O Card em si (Efeito Vidro) */}
          <div className="relative bg-tcg-surface backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2 group-hover:shadow-card-hover group-hover:border-tcg-accent/40">
            
            {/* Tag de Categoria flutuante */}
            <div className="absolute top-8 right-8 z-20 bg-tcg-background/90 backdrop-blur-sm border border-white/10 text-gray-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              Produto Selado
            </div>

            {/* Espaço para Imagem com proporção flexível */}
            <div className="w-full aspect-[4/5] bg-gray-900 rounded-xl mb-5 flex items-center justify-center border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
              <span className="text-gray-600 font-medium tracking-widest text-sm uppercase">Foto do Produto</span>
            </div>

            {/* Informações do Produto */}
            <div className="flex justify-between items-start mb-4 gap-2">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors leading-tight">Elite Trainer Box</h3>
                <p className="text-xs text-gray-400 mt-1">Pokémon TCG • Escarlate e Violeta</p>
              </div>
              <span className="text-lg font-black text-tcg-primary shrink-0">R$ 350,00</span>
            </div>

            {/* Botão de Compra Secundário */}
            <button className="w-full bg-white/5 hover:bg-tcg-primary hover:text-white border border-white/10 hover:border-tcg-primary hover:shadow-neon text-gray-300 font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Comprar via WhatsApp
            </button>
          </div>
        </div>

      </main>
    </div>
  )
}

export default App