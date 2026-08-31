import { useState } from 'react';
import productsData from './data/products.json';

function App() {
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filteredProducts = activeCategory === 'Todos' 
    ? productsData 
    : productsData.filter(product => product.category === activeCategory);

  return (
    <div className="min-h-screen bg-tcg-background text-gray-200 font-sans relative overflow-x-hidden selection:bg-tcg-primary selection:text-white pb-20">
      
      {/* Cabeçalho */}
      <header className="fixed w-full top-0 z-50 bg-tcg-background/90 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter text-white">
          GORDÃO <span className="text-transparent bg-clip-text bg-gradient-to-r from-tcg-primary to-orange-400">CARTAS</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
          {['Todos', 'Cartas Avulsas', 'Decks & Selados', 'Acessórios'].map(category => (
            <button 
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`transition hover:text-tcg-accent ${activeCategory === category ? 'text-tcg-primary font-bold' : ''}`}
            >
              {category}
            </button>
          ))}
        </nav>
      </header>

      {/* Hero Section (Topo) */}
      <section className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto text-center md:text-left flex flex-col items-center md:items-start">
        <div className="inline-block px-3 py-1 mb-6 rounded-full bg-tcg-accent/20 border border-tcg-accent/40 text-purple-300 text-xs font-bold tracking-wide uppercase shadow-[0_0_10px_rgba(157,78,221,0.2)]">
          ✨ Estoque Atualizado
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
          O arsenal completo para o seu <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-tcg-accent to-purple-400">próximo duelo.</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mb-8">
          Cartas avulsas, decks competitivos, produtos selados e acessórios premium. Tudo o que você precisa para jogar e colecionar.
        </p>
      </section>

      {/* Catálogo de Produtos */}
      <main className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <h2 className="text-3xl font-black text-white">Nosso Catálogo</h2>
          <span className="text-tcg-primary font-bold">{filteredProducts.length} itens</span>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative group bg-tcg-surface backdrop-blur-xl border border-white/10 p-4 rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover hover:border-tcg-accent/40 flex flex-col h-full">
              
              <div className="absolute top-6 right-6 z-20 bg-tcg-background/90 backdrop-blur-sm border border-white/10 text-gray-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                {product.category}
              </div>

              <div className="w-full aspect-[4/5] bg-gray-900 rounded-xl mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%] z-10"></div>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors leading-tight mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {product.game} {product.expansion && `• ${product.expansion}`} {product.condition && `• ${product.condition}`}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <span className="text-xl font-black text-tcg-primary">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <button className="bg-white/5 hover:bg-tcg-primary hover:text-white border border-white/10 hover:border-tcg-primary text-gray-300 font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                    Comprar
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            Nenhum produto encontrado nesta categoria.
          </div>
        )}
      </main>

    </div>
  )
}

export default App