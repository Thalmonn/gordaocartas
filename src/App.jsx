import { useState } from 'react';
import productsData from './data/products.json';

function App() {
  // Estado para controlar qual "página" o usuário está vendo
  const [currentView, setCurrentView] = useState('Home'); // 'Home' ou 'Catalog'
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  // Estados do Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cep, setCep] = useState('');
  const [shippingInfo, setShippingInfo] = useState(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const filteredProducts = activeCategory === 'Todos' 
    ? productsData 
    : productsData.filter(product => product.category === activeCategory);

  const featuredProduct = productsData.find(product => product.featured) || productsData[0];
  const carouselCards = productsData.filter(product => product.category === 'Cartas Avulsas');
  const infiniteCarousel = [...carouselCards, ...carouselCards, ...carouselCards, ...carouselCards];

  // Sistema de Navegação
  const goToHome = (e) => {
    e.preventDefault();
    setCurrentView('Home');
    setActiveCategory('Todos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToCategory = (e, category) => {
    e.preventDefault();
    setCurrentView('Catalog');
    setActiveCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sistema de Frete
  const handleCalculateShipping = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      alert("Por favor, digite um CEP válido com 8 dígitos.");
      return;
    }
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (data.erro) {
        alert("CEP não encontrado.");
        setShippingInfo(null);
      } else {
        setShippingInfo({ city: data.localidade, state: data.uf, pac: 25.90, sedex: 45.50 });
      }
    } catch (error) {
      console.error("Erro na integração com ViaCEP:", error);
      alert("Erro ao buscar o CEP.");
    } finally {
      setIsLoadingCep(false);
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setCep('');
    setShippingInfo(null);
  };

  return (
    <div className="min-h-screen bg-tcg-background text-gray-200 font-sans relative overflow-x-hidden selection:bg-tcg-primary selection:text-white pb-20">
      
      {/* CABEÇALHO GLOBAL (Aparece em todas as páginas) */}
      <header className="fixed w-full top-0 z-50 bg-tcg-background/90 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <a href="#" onClick={goToHome} className="text-2xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity">
          GORDÃO <span className="text-transparent bg-clip-text bg-gradient-to-r from-tcg-primary to-orange-400">CARTAS</span>
        </a>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
          <a href="#" onClick={goToHome} className={`transition hover:text-tcg-accent ${currentView === 'Home' ? 'text-tcg-primary font-bold' : ''}`}>
            Início
          </a>
          {['Cartas Avulsas', 'Decks & Selados', 'Acessórios'].map(category => (
            <a 
              key={category} 
              href="#" 
              onClick={(e) => goToCategory(e, category)} 
              className={`transition hover:text-tcg-accent ${(currentView === 'Catalog' && activeCategory === category) ? 'text-tcg-primary font-bold' : ''}`}
            >
              {category}
            </a>
          ))}
        </nav>
      </header>

      {/* RENDERIZAÇÃO DA PÁGINA "HOME" */}
      {currentView === 'Home' && (
        <div className="animate-fade-in">
          <section className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-6 z-10 text-center md:text-left">
              <div className="inline-block px-3 py-1 rounded-full bg-tcg-accent/20 border border-tcg-accent/40 text-purple-300 text-xs font-bold tracking-wide uppercase shadow-[0_0_10px_rgba(157,78,221,0.2)]">
                ✨ Destaque da Semana
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
                O arsenal completo para o seu <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-tcg-accent to-purple-400">próximo duelo.</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl mx-auto md:mx-0">
                Cartas avulsas, decks competitivos, produtos selados e acessórios premium. Tudo o que você precisa, direto do Gordão para a sua mesa.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button onClick={(e) => goToCategory(e, 'Todos')} className="bg-tcg-primary hover:bg-tcg-glow hover:shadow-neon text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                  Ver Catálogo Completo
                </button>
                <button onClick={(e) => goToCategory(e, 'Acessórios')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300">
                  Explorar Acessórios
                </button>
              </div>
            </div>

            {featuredProduct && (
              <div className="flex-1 w-full max-w-sm relative z-10 group mt-8 md:mt-0 hidden md:block">
                <div className="absolute inset-0 bg-tcg-accent/20 blur-[50px] rounded-full group-hover:bg-tcg-accent/30 transition duration-500"></div>
                <div className="relative bg-tcg-surface backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:shadow-card-hover hover:border-tcg-accent/40">
                  <div className="w-full aspect-[4/5] bg-gray-900 rounded-xl mb-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-full group-hover:translate-x-full z-10 pointer-events-none"></div>
                    <img src={featuredProduct.image} alt={featuredProduct.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors leading-tight">{featuredProduct.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{featuredProduct.expansion}</p>
                    </div>
                    <span className="text-lg font-black text-tcg-primary shrink-0">R$ {featuredProduct.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button onClick={() => setSelectedProduct(featuredProduct)} className="w-full bg-white/5 hover:bg-tcg-primary hover:text-white border border-white/10 hover:border-tcg-primary text-gray-300 font-semibold py-3 rounded-lg transition-all duration-300">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            )}
          </section>

          {carouselCards.length > 0 && (
            <section className="py-12 border-y border-white/5 bg-black/30 overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-tcg-background to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-tcg-background to-transparent z-10 pointer-events-none"></div>
              <h3 className="text-center text-gray-400 font-medium tracking-widest text-xs uppercase mb-8">Destaques em Cartas Avulsas</h3>
              <div className="animate-marquee gap-6 px-6">
                {infiniteCarousel.map((product, index) => (
                  <div key={index} onClick={() => setSelectedProduct(product)} className="w-48 shrink-0 relative group cursor-pointer transition-transform duration-300 hover:scale-105">
                    <div className="w-full aspect-[63/88] bg-gray-900 rounded-xl overflow-hidden border border-white/10 group-hover:border-tcg-primary/50 relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full z-10 pointer-events-none"></div>
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-3 text-center">
                      <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                      <span className="text-tcg-primary font-black text-sm">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* RENDERIZAÇÃO DA PÁGINA "CATÁLOGO" */}
      {currentView === 'Catalog' && (
        <main className="pt-32 px-6 md:px-12 max-w-7xl mx-auto animate-fade-in">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-white/10 pb-4 gap-4">
            <div>
              <h2 className="text-4xl font-black text-white">Catálogo</h2>
              <p className="text-gray-400 mt-1">Navegando em: <strong className="text-tcg-accent">{activeCategory}</strong></p>
            </div>
            
            {/* Sub-menu de filtros dentro do catálogo */}
            <div className="flex gap-2 bg-black/30 p-1 rounded-lg border border-white/5 overflow-x-auto w-full md:w-auto">
               {['Todos', 'Cartas Avulsas', 'Decks & Selados', 'Acessórios'].map(cat => (
                 <button
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === cat ? 'bg-tcg-surface border border-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                 >
                   {cat}
                 </button>
               ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-tcg-surface/30 rounded-2xl border border-white/5">
              <span className="text-4xl mb-4 block">📭</span>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum item encontrado</h3>
              <p className="text-gray-400">Não há produtos cadastrados na categoria {activeCategory} no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative group bg-tcg-surface backdrop-blur-xl border border-white/10 p-4 rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover hover:border-tcg-accent/40 flex flex-col h-full">
                  <div className="absolute top-6 right-6 z-20 bg-tcg-background/90 backdrop-blur-sm border border-white/10 text-gray-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {product.category}
                  </div>
                  <div className="w-full aspect-[4/5] bg-gray-900 rounded-xl mb-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-x-full group-hover:translate-x-full z-10 pointer-events-none"></div>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors leading-tight mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-400 mb-3">{product.game} {product.expansion && `• ${product.expansion}`} {product.condition && `• ${product.condition}`}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <span className="text-xl font-black text-tcg-primary">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                      <button onClick={() => setSelectedProduct(product)} className="bg-white/5 hover:bg-tcg-primary hover:text-white border border-white/10 hover:border-tcg-primary text-gray-300 font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* MODAL GLOBAL DE PRODUTO */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-tcg-surface border border-white/10 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl flex flex-col md:flex-row gap-6">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-light leading-none">&times;</button>
            <div className="w-full md:w-1/3 aspect-[4/5] bg-gray-900 rounded-xl overflow-hidden shrink-0 relative">
               <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-black text-white">{selectedProduct.name}</h2>
                  {selectedProduct.inStock && (
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Em Estoque</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{selectedProduct.game} {selectedProduct.expansion && `• ${selectedProduct.expansion}`}</p>
                {selectedProduct.condition && (
                  <span className="inline-block mt-2 bg-tcg-accent/20 border border-tcg-accent/30 text-purple-200 text-xs px-2 py-1 rounded">Estado: {selectedProduct.condition}</span>
                )}
              </div>
              <span className="text-3xl font-black text-tcg-primary mb-6">R$ {selectedProduct.price.toFixed(2).replace('.', ',')}</span>
              
              <div className="bg-tcg-background/50 border border-tcg-accent/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-300 font-medium mb-2"><span className="text-tcg-accent font-bold">⚠️ Atenção:</span> Não possuímos loja física para retirada.</p>
                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                  <li>Envios via Correios (frete por conta do comprador).</li>
                  <li>Entrega pessoalmente apenas mediante combinação.</li>
                </ul>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Simular Frete</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Digite seu CEP" value={cep} onChange={(e) => setCep(e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-tcg-primary transition-colors" />
                  <button onClick={handleCalculateShipping} disabled={isLoadingCep} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                    {isLoadingCep ? '...' : 'Calcular'}
                  </button>
                </div>
                {shippingInfo && (
                  <div className="mt-4 text-sm bg-black/30 p-3 rounded-lg border border-white/5">
                    <p className="text-gray-300 mb-2">Envio para <strong className="text-white">{shippingInfo.city} - {shippingInfo.state}</strong></p>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-gray-400">PAC (Simulado)</span>
                      <strong className="text-white">R$ {shippingInfo.pac.toFixed(2).replace('.', ',')}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-400">Sedex (Simulado)</span>
                      <strong className="text-white">R$ {shippingInfo.sedex.toFixed(2).replace('.', ',')}</strong>
                    </div>
                  </div>
                )}
              </div>
              <button className="mt-auto w-full bg-tcg-primary hover:bg-tcg-glow shadow-neon text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center gap-2">
                Continuar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App