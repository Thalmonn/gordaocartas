import { useState, useEffect, useMemo, useRef } from 'react';
import productsData from './data/products.json';
import banner1 from './assets/banner1.webp';
import banner2 from './assets/banner2.webp';
import banner3 from './assets/banner3.webp';

const getCardNumber = (product) => {
  if (!product) return '';
  if (product.number) return product.number.toString();
  if (product.image) {
    const match = product.image.match(/\/[^/]+_([0-9a-zA-Z]+)_R_/);
    if (match && match[1]) return match[1];
  }
  return '';
};

const formatWhatsappCardDetails = (product) => {
  const details = [];
  if (product.expansion) details.push(`Col: ${product.expansion}`);
  const cardNum = getCardNumber(product);
  if (cardNum) details.push(`#${cardNum}`);
  if (product.condition) details.push(product.condition);
  return details.length > 0 ? `[${details.join(' | ')}]` : '';
};

function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.href.includes('/cadastrar/produto')) {
      return 'CadastrarProduto';
    }
    return 'Home';
  });
  
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cep, setCep] = useState('');
  const [shippingInfo, setShippingInfo] = useState(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const INITIAL_VISIBLE_COUNT = 12;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const modalHistoryPushedRef = useRef(false);

  const [generatedJson, setGeneratedJson] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '', category: 'Cartas Avulsas', game: 'Pokémon TCG', expansion: '',
    condition: 'NM', price: '', image: '', featured: false, stock: 1
  });

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const banners = [banner1, banner2, banner3];

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('gc-cart');
      if (savedCart) return JSON.parse(savedCart);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('gc-cart', JSON.stringify(cart));
  }, [cart]);

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.qty), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.qty, 0), [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert(`Limite máximo! Temos apenas ${product.stock} unidades em estoque.`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    closeProductModal();
    setIsCartOpen(true);
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.qty + delta;
        if (newQty > 0 && newQty <= item.stock) return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.id !== productId));
  const clearCart = () => setCart([]);

  const handleCartWhatsAppCheckout = () => {
    const phoneNumber = "5583998268170";
    let message = `Olá, Gordão Cartas! Quero finalizar meu pedido:\n\n`;
    cart.forEach(item => {
      const details = formatWhatsappCardDetails(item);
      const itemTotal = (item.price * item.qty).toFixed(2).replace('.', ',');
      message += `- ${item.qty}x ${item.name} ${details ? `${details} ` : ''}- R$ ${itemTotal}\n`;
    });
    message += `\n*TOTAL:* R$ ${cartTotal.toFixed(2).replace('.', ',')}`;
    message += `\n\nPor favor, me informem o frete e as opções de pagamento.`;
    window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, '_blank');
  };

  useEffect(() => {
    if (currentView !== 'Home') return;
    
    const timer = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 10000);
    
    return () => clearInterval(timer);
  }, [currentView, banners.length]);

  useEffect(() => {
    const handlePopState = (event) => {
      if (modalHistoryPushedRef.current) {
        modalHistoryPushedRef.current = false;
        setSelectedProduct(null);
        setCep('');
        setShippingInfo(null);
        return;
      }

      setSelectedProduct(null);
      setCep('');
      setShippingInfo(null);

      if (event.state) {
        setCurrentView(event.state.view || 'Home');
        setActiveCategory(event.state.category || 'Todos');
        setSearchQuery(event.state.search || '');
        setVisibleCount(event.state.visibleCount || INITIAL_VISIBLE_COUNT);
      } else {
        const isCadastrar = window.location.href.includes('/cadastrar/produto');
        setCurrentView(isCadastrar ? 'CadastrarProduto' : 'Home');
        setActiveCategory('Todos');
        setSearchQuery('');
        setVisibleCount(INITIAL_VISIBLE_COUNT);
      }
      setIsMobileMenuOpen(false);
      setIsFilterDropdownOpen(false);
      setIsCartOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    if (!window.history.state) {
      window.history.replaceState({ view: currentView, category: 'Todos', search: '', visibleCount: INITIAL_VISIBLE_COUNT, modalOpen: false }, '');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  const navigateTo = (view, category, search = '') => {
    const currentUrl = window.location.href;
    if (currentUrl.includes('/cadastrar/produto') && view !== 'CadastrarProduto') {
      const cleanUrl = currentUrl.replace('/cadastrar/produto', '');
      window.history.pushState({ view, category, search, visibleCount: INITIAL_VISIBLE_COUNT, modalOpen: false }, '', cleanUrl);
    } 
    else if (currentView !== view || activeCategory !== category || searchQuery !== search) {
      window.history.pushState({ view, category, search, visibleCount: INITIAL_VISIBLE_COUNT, modalOpen: false }, '');
    }
    setCurrentView(view);
    setActiveCategory(category);
    setSearchQuery(search);
    setIsMobileMenuOpen(false);
    setIsFilterDropdownOpen(false);
    setIsCartOpen(false);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProductModal = (product) => {
    window.history.replaceState({
      view: currentView,
      category: activeCategory,
      search: searchQuery,
      visibleCount: visibleCount,
      modalOpen: false
    }, '');
    modalHistoryPushedRef.current = true;
    setSelectedProduct(product);
    window.history.pushState({
      view: currentView,
      category: activeCategory,
      search: searchQuery,
      visibleCount: visibleCount,
      modalOpen: true
    }, '');
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setCep('');
    setShippingInfo(null);
    if (modalHistoryPushedRef.current) {
      window.history.back();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedProduct) {
        closeProductModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    return productsData.filter(product => {
      const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
      const cardNum = getCardNumber(product);
      const q = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(q) ||
        (product.game && product.game.toLowerCase().includes(q)) ||
        (product.expansion && product.expansion.toLowerCase().includes(q)) ||
        (cardNum && cardNum.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const featuredProduct = useMemo(() => productsData.find(product => product.featured === true) || null, []);
  const baseCarouselCards = useMemo(() => productsData.filter(product => product.featured === true), []);
  const carouselTrack = [...baseCarouselCards, ...baseCarouselCards, ...baseCarouselCards, ...baseCarouselCards];
  const carouselAnimationDuration = carouselTrack.length > 0 ? `${carouselTrack.length * 3}s` : '30s';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') navigateTo('Catalog', 'Todos', searchQuery);
  };

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
      console.error("Erro no ViaCEP:", error);
      alert("Erro ao buscar o CEP.");
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    const phoneNumber = "5583998268170"; 
    const details = formatWhatsappCardDetails(selectedProduct);
    let message = `Olá, Gordão Cartas! Tenho interesse no produto:\n\n*${selectedProduct.name}* ${details}\nValor: R$ ${selectedProduct.price.toFixed(2).replace('.', ',')}`;
    if (cep) {
      message += `\n\nMeu CEP é: ${cep}`;
      if (shippingInfo) message += `\n(Simulação no site - PAC: R$ ${shippingInfo.pac.toFixed(2).replace('.', ',')} | Sedex: R$ ${shippingInfo.sedex.toFixed(2).replace('.', ',')})`;
    } else {
      message += `\n\nAinda não calculei o frete / Combinar entrega.`;
    }
    window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleGenerateJson = (e) => {
    e.preventDefault();
    const finalProduct = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      game: newProduct.game,
      expansion: newProduct.expansion,
      condition: newProduct.condition,
      price: parseFloat(newProduct.price.replace(',', '.')),
      image: newProduct.image || "https://placehold.co/400x560/1C0F2D/FF6B00?text=Sem+Foto",
      featured: newProduct.featured,
      inStock: newProduct.stock > 0,
      stock: parseInt(newProduct.stock)
    };
    setGeneratedJson(JSON.stringify(finalProduct, null, 2) + ',');
  };

  return (
    <div className="min-h-screen flex flex-col bg-tcg-background text-gray-200 font-sans relative overflow-x-hidden selection:bg-tcg-primary selection:text-white">
      <header className="fixed w-full top-0 z-50 bg-tcg-background/90 backdrop-blur-md border-b border-white/5 py-3 px-4 md:px-12 flex justify-between items-center gap-4">
        <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('Home', 'Todos'); }} className="text-xl md:text-2xl font-black tracking-tighter text-white hover:opacity-80 transition-opacity shrink-0">
          GORDÃO <span className="text-transparent bg-clip-text bg-gradient-to-r from-tcg-primary to-orange-400">CARTAS</span>
        </a>

        {currentView !== 'CadastrarProduto' && (
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-auto hidden md:block">
            <input 
              type="text"
              placeholder="O que você procura para a sua coleção?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 focus:border-tcg-primary focus:bg-white/10 rounded-full px-6 py-2.5 text-sm md:text-base font-medium text-white placeholder-gray-400 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] outline-none text-center"
            />
          </form>
        )}

        <div className="flex items-center gap-6 shrink-0">
          <nav className="hidden xl:flex gap-6 text-sm font-medium text-gray-400">
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('Home', 'Todos'); }} className={`transition hover:text-tcg-accent ${currentView === 'Home' ? 'text-tcg-primary font-bold' : ''}`}>
              Início
            </a>
            {['Cartas Avulsas', 'Decks & Selados', 'Acessórios'].map(category => (
              <a 
                key={category} 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigateTo('Catalog', category); }} 
                className={`transition hover:text-tcg-accent ${(currentView === 'Catalog' && activeCategory === category) ? 'text-tcg-primary font-bold' : ''}`}
              >
                {category}
              </a>
            ))}
          </nav>
          
          <button onClick={() => setIsCartOpen(true)} className="relative text-white hover:text-tcg-primary transition-colors focus:outline-none p-1 block">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-tcg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-tcg-background">
                {cartCount}
              </span>
            )}
          </button>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-tcg-primary transition-colors focus:outline-none p-1 block">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </header>

      {/* DRAWER DO CARRINHO */}
      <div className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
        <div className={`relative w-96 max-w-full bg-tcg-background border-l border-white/10 h-full shadow-2xl flex flex-col transition-transform duration-300 transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-black/40">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              🛒 Meu Carrinho
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                <span className="text-4xl mb-4">🛒</span>
                <p>Seu carrinho está vazio.</p>
              </div>
            ) : (
              cart.map(item => {
                const cardNum = getCardNumber(item);
                return (
                  <div key={item.id} className="flex gap-4 bg-white/5 border border-white/10 p-3 rounded-xl relative group">
                    <img src={item.image} alt={item.name} className="w-14 aspect-[460/640] object-contain rounded-md bg-transparent" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-400">
                          {item.condition}
                          {item.expansion ? ` • ${item.expansion}` : ''}
                          {cardNum ? ` #${cardNum}` : ''}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-tcg-primary font-bold text-sm">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                        <div className="flex items-center bg-black/50 rounded-lg border border-white/10 overflow-hidden">
                          <button onClick={() => updateCartQty(item.id, -1)} className="px-2 py-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">-</button>
                          <span className="px-2 text-xs font-bold text-white w-6 text-center">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="px-2 py-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">+</button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg transition-colors">
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 bg-black/60 border-t border-white/10 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-xl font-black text-white">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <button onClick={clearCart} className="text-xs text-gray-500 hover:text-red-400 underline transition-colors">Limpar Carrinho</button>
                <span className="text-xs text-gray-500">Frete calculado no WhatsApp</span>
              </div>
              <button onClick={handleCartWhatsAppCheckout} className="w-full bg-tcg-primary hover:bg-tcg-glow shadow-neon text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center gap-2">
                Finalizar Pedido
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MENU MOBILE */}
      <div className={`fixed inset-0 z-40 flex justify-end transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`relative w-80 max-w-full bg-tcg-background border-l border-white/10 h-full shadow-2xl flex flex-col transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <h2 className="text-xl font-black text-white">Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-4 md:hidden">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <input type="text" placeholder="Buscar itens..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-white placeholder-gray-400 focus:outline-none focus:border-tcg-primary" />
            </form>
          </div>
          <nav className="flex flex-col p-4 gap-1">
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('Home', 'Todos'); }} className={`px-4 py-3 rounded-lg text-lg font-medium transition-all ${currentView === 'Home' ? 'bg-tcg-primary/10 text-tcg-primary border-l-2 border-tcg-primary' : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
              Início
            </a>
            {['Cartas Avulsas', 'Decks & Selados', 'Acessórios'].map(category => (
              <a key={category} href="#" onClick={(e) => { e.preventDefault(); navigateTo('Catalog', category); }} className={`px-4 py-3 rounded-lg text-lg font-medium transition-all ${(currentView === 'Catalog' && activeCategory === category) ? 'bg-tcg-primary/10 text-tcg-primary border-l-2 border-tcg-primary' : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}>
                {category}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {currentView === 'CadastrarProduto' && (
        <main className="pt-32 px-6 md:px-12 pb-16 max-w-3xl mx-auto flex-1 w-full animate-fade-in">
          <div className="mb-8 border-b border-white/10 pb-4">
            <h2 className="text-4xl font-black text-white">Cadastrar Produto</h2>
            <p className="text-gray-400 mt-1">Gerador de bloco JSON formatado</p>
          </div>

          <div className="bg-tcg-surface border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl">
            <form onSubmit={handleGenerateJson} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome do Produto</label>
                  <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tcg-primary outline-none" placeholder="Ex: Charizard Base Set" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Preço (R$)</label>
                  <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tcg-primary outline-none" placeholder="Ex: 150.50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Categoria</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tcg-primary outline-none">
                    <option>Cartas Avulsas</option>
                    <option>Decks & Selados</option>
                    <option>Acessórios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Estoque (Unidades)</label>
                  <input required type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tcg-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Jogo / Franquia</label>
                  <input type="text" value={newProduct.game} onChange={e => setNewProduct({...newProduct, game: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tcg-primary outline-none" placeholder="Ex: Pokémon TCG" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Expansão</label>
                  <input type="text" value={newProduct.expansion} onChange={e => setNewProduct({...newProduct, expansion: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tcg-primary outline-none" placeholder="Ex: Obsidian Flames" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Condição</label>
                  <input type="text" value={newProduct.condition} onChange={e => setNewProduct({...newProduct, condition: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tcg-primary outline-none" placeholder="Ex: NM, LP, Novo/Lacrado" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">URL da Imagem</label>
                  <input type="text" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-tcg-primary outline-none" placeholder="Caminho WebP (ex: /cartas/carta1.webp)" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={newProduct.featured} onChange={e => setNewProduct({...newProduct, featured: e.target.checked})} className="w-4 h-4 accent-tcg-primary" />
                <label htmlFor="featured" className="text-sm font-medium text-gray-300">Destacar este produto na Capa do site?</label>
              </div>
              <button type="submit" className="w-full bg-tcg-primary hover:bg-tcg-glow shadow-neon text-white font-bold py-4 rounded-xl transition-all duration-300">
                Gerar Bloco de Código
              </button>
            </form>

            {generatedJson && (
              <div className="mt-8 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-green-400 uppercase">Código Gerado com Sucesso!</label>
                  <button onClick={() => navigator.clipboard.writeText(generatedJson)} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors">Copiar</button>
                </div>
                <textarea readOnly value={generatedJson} className="w-full h-80 bg-black/80 border border-white/10 rounded-lg p-4 text-sm text-green-300 font-mono focus:outline-none resize-none" />
              </div>
            )}
          </div>
        </main>
      )}

      {currentView === 'Home' && (
        <div className="animate-fade-in flex-1">
          
          <section className="pt-24 md:pt-28 px-4 md:px-12 max-w-7xl mx-auto w-full mb-16">
            <div className="relative w-full h-[280px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group bg-gray-900">
              
              {banners.map((imgUrl, index) => (
                <img
                  key={index}
                  src={imgUrl}
                  alt={`Banner ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}

              <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-3">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentBannerIndex ? 'bg-tcg-primary w-8' : 'bg-white/30 hover:bg-white/60'}`}
                    aria-label={`Ir para a imagem ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-6 z-10 text-center md:text-left">
              <div className="inline-block px-3 py-1 rounded-full bg-tcg-accent/20 border border-tcg-accent/40 text-purple-300 text-xs font-bold tracking-wide uppercase shadow-[0_0_10px_rgba(157,78,221,0.2)]">
                ✨ Destaque da Semana
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                A carta perfeita <br className="hidden md:block" />
                para o seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-tcg-primary to-purple-400">binder.</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-xl mx-auto md:mx-0">
                Cartas avulsas, decks competitivos, produtos selados e acessórios premium meticulosamente selecionados pelo Gordão.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button onClick={() => navigateTo('Catalog', 'Todos')} className="bg-tcg-primary hover:bg-tcg-glow hover:shadow-neon text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                  Explorar Catálogo
                </button>
                <button onClick={() => navigateTo('Catalog', 'Acessórios')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300">
                  Ver Acessórios
                </button>
              </div>
            </div>

            {featuredProduct && (
              <div className="flex-1 w-full max-w-sm relative z-10 group mt-8 md:mt-0 hidden md:block">
                <div className="absolute inset-0 bg-tcg-accent/20 blur-[50px] rounded-full group-hover:bg-tcg-accent/30 transition duration-500"></div>
                <div className="relative bg-tcg-surface backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:shadow-card-hover hover:border-tcg-accent/40">
                  
                  <div className="w-full aspect-[460/640] bg-transparent rounded-xl mb-5 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => openProductModal(featuredProduct)}>
                    <img src={featuredProduct.image} alt={featuredProduct.name} loading="lazy" decoding="async" className="w-full h-full object-contain drop-shadow-2xl" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div>
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => openProductModal(featuredProduct)}>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors leading-tight">{featuredProduct.name}</h3>
                        {featuredProduct.condition && (
                          <span className="bg-tcg-primary/20 text-tcg-primary border border-tcg-primary/30 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {featuredProduct.condition}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {featuredProduct.expansion}
                        {getCardNumber(featuredProduct) ? ` #${getCardNumber(featuredProduct)}` : ''}
                      </p>
                    </div>
                    <span className="text-lg font-black text-tcg-primary shrink-0">R$ {featuredProduct.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button onClick={() => openProductModal(featuredProduct)} className="w-full bg-white/5 hover:bg-tcg-primary hover:text-white border border-white/10 hover:border-tcg-primary text-gray-300 font-semibold py-3 rounded-lg transition-all duration-300">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            )}
          </section>

          {baseCarouselCards.length > 0 && (
            <section className="py-16 border-y border-white/5 bg-black/30 relative w-full overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-tcg-background to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-tcg-background to-transparent z-10 pointer-events-none"></div>
              
              <div className="relative z-20 flex flex-col items-center mb-6 text-center px-4">
                <h2 className="text-2xl md:text-4xl font-black text-gray-200 uppercase tracking-[0.15em]">
                  Cartas Avulsas
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-bold tracking-[0.3em] mt-2 uppercase">
                  Destaques da Coleção
                </p>
                <div className="w-12 h-1 bg-white/10 mt-6 rounded-full"></div>
              </div>
              
              <div className="flex w-full overflow-hidden group py-6">
                <div 
                  className="flex animate-marquee group-hover:[animation-play-state:paused] min-w-max"
                  style={{ animationDuration: carouselAnimationDuration }}
                >
                  {carouselTrack.map((product, index) => (
                    <div key={`track1-${index}`} onClick={() => openProductModal(product)} className="w-48 shrink-0 mx-3 relative group/card cursor-pointer transition-transform duration-300 hover:scale-105">
                      
                      <div className="w-full aspect-[460/640] bg-transparent rounded-xl overflow-hidden border border-transparent group-hover/card:border-tcg-primary/30 relative flex items-center justify-center transition-colors">
                        <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-contain drop-shadow-xl" />
                      </div>
                      
                      <div className="mt-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                          {product.condition && <span className="text-[10px] font-bold text-tcg-primary bg-tcg-primary/10 px-1 rounded">{product.condition}</span>}
                        </div>
                        <span className="text-tcg-primary font-black text-sm">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div 
                  className="flex animate-marquee group-hover:[animation-play-state:paused] min-w-max" 
                  aria-hidden="true"
                  style={{ animationDuration: carouselAnimationDuration }}
                >
                  {carouselTrack.map((product, index) => (
                    <div key={`track2-${index}`} onClick={() => openProductModal(product)} className="w-48 shrink-0 mx-3 relative group/card cursor-pointer transition-transform duration-300 hover:scale-105">
                      
                      <div className="w-full aspect-[460/640] bg-transparent rounded-xl overflow-hidden border border-transparent group-hover/card:border-tcg-primary/30 relative flex items-center justify-center transition-colors">
                        <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-contain drop-shadow-xl" />
                      </div>

                      <div className="mt-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                          {product.condition && <span className="text-[10px] font-bold text-tcg-primary bg-tcg-primary/10 px-1 rounded">{product.condition}</span>}
                        </div>
                        <span className="text-tcg-primary font-black text-sm">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {currentView === 'Catalog' && (
        <main className="pt-32 px-6 md:px-12 pb-16 max-w-7xl mx-auto flex-1 w-full animate-fade-in">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-4">
            <div>
              <h2 className="text-4xl font-black text-white">Catálogo</h2>
              <p className="text-gray-400 mt-1">{searchQuery ? `Resultados para: "${searchQuery}"` : `Navegando em: ${activeCategory}`}</p>
            </div>
            
            <div className="relative w-full md:w-auto flex justify-end">
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center justify-center gap-3 w-full md:w-auto bg-black/40 border border-white/10 hover:border-tcg-primary text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filtros {activeCategory !== 'Todos' && <span className="text-tcg-primary font-bold">({activeCategory})</span>}
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-tcg-surface border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 py-2 overflow-hidden animate-fade-in backdrop-blur-xl">
                  {['Todos', 'Cartas Avulsas', 'Decks & Selados', 'Acessórios'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => { navigateTo('Catalog', cat); setIsFilterDropdownOpen(false); }}
                      className={`w-full text-left px-6 py-4 text-sm font-medium transition-all ${activeCategory === cat && !searchQuery ? 'bg-tcg-primary/10 text-tcg-primary border-l-4 border-tcg-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="text-center py-20 bg-tcg-surface/30 rounded-3xl border border-white/5">
              <span className="text-5xl mb-4 block opacity-50">📭</span>
              <h3 className="text-2xl font-bold text-white mb-2">Nenhum item encontrado</h3>
              <p className="text-gray-400">Não há produtos correspondentes à sua busca no momento.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                {visibleProducts.map((product) => {
                  const cardNum = getCardNumber(product);
                  return (
                    <div key={product.id} className="relative group bg-tcg-surface backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover hover:border-tcg-accent/40 flex flex-col h-full">
                      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20 bg-tcg-background/90 backdrop-blur-sm border border-white/10 text-gray-300 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded uppercase tracking-wider">{product.category}</div>
                      
                      <div 
                        className="w-full aspect-[460/640] bg-transparent rounded-lg sm:rounded-xl mb-3 sm:mb-4 relative overflow-hidden group flex items-center justify-center cursor-pointer"
                        onClick={() => openProductModal(product)}
                      >
                        <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-contain drop-shadow-xl" />
                      </div>

                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div 
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1.5 sm:mb-1 cursor-pointer"
                            onClick={() => openProductModal(product)}
                          >
                            <h3 className="text-sm sm:text-lg font-bold text-white group-hover:text-purple-200 transition-colors leading-tight">{product.name}</h3>
                            {product.condition && <span className="bg-tcg-primary/20 text-tcg-primary border border-tcg-primary/30 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">{product.condition}</span>}
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-400 mb-1.5 sm:mb-2 truncate">
                            {product.game}
                            {product.expansion ? ` • ${product.expansion}` : ''}
                            {cardNum ? ` #${cardNum}` : ''}
                          </p>
                          <p className="text-[9px] sm:text-[11px] text-gray-400 mb-2 sm:mb-3">Estoque: <strong className="text-gray-200">{product.stock} un.</strong></p>
                        </div>
                        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-white/5 gap-2 sm:gap-0">
                          <span className="text-base sm:text-xl font-black text-tcg-primary">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                          <button onClick={() => openProductModal(product)} className="w-full xl:w-auto bg-white/5 hover:bg-tcg-primary hover:text-white border border-white/10 hover:border-tcg-primary text-gray-300 font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm">Comprar</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="bg-tcg-surface border border-white/10 hover:border-tcg-primary text-gray-300 hover:text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg"
                  >
                    Carregar Mais Produtos
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      )}

      {/* overflow-y-auto) */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeProductModal}
        >
          <div 
            className="bg-tcg-surface border border-white/10 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 relative shadow-2xl flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeProductModal} 
              className="sticky md:absolute top-0 md:top-4 right-0 md:right-4 ml-auto z-20 bg-black/60 md:bg-transparent w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white text-2xl md:text-3xl font-light leading-none transition-colors shrink-0"
              aria-label="Fechar"
            >
              &times;
            </button>
            
            <div className="w-36 sm:w-44 md:w-1/3 mx-auto aspect-[460/640] bg-transparent rounded-xl sm:rounded-2xl overflow-hidden shrink-0 relative flex items-center justify-center -mt-6 md:mt-0">
              <img src={selectedProduct.image} alt={selectedProduct.name} loading="lazy" decoding="async" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="mb-3 sm:mb-6">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">{selectedProduct.name}</h2>
                  {selectedProduct.condition && <span className="bg-tcg-primary/20 text-tcg-primary border border-tcg-primary/30 text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded">Condição: {selectedProduct.condition}</span>}
                  {selectedProduct.stock > 0 ? (
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[11px] sm:text-xs uppercase font-bold px-2 py-0.5 rounded">Em Estoque ({selectedProduct.stock} un.)</span>
                  ) : (
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] sm:text-xs uppercase font-bold px-2 py-0.5 rounded">Esgotado</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400">
                  {selectedProduct.game}
                  {selectedProduct.expansion ? ` • Coleção: ${selectedProduct.expansion}` : ''}
                  {getCardNumber(selectedProduct) ? ` • Nº ${getCardNumber(selectedProduct)}` : ''}
                </p>
              </div>

              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-tcg-primary mb-4 sm:mb-6">
                R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
              </span>
              
              <div className="bg-tcg-background/50 border border-tcg-accent/30 rounded-xl p-3.5 sm:p-5 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-300 font-medium mb-2"><span className="text-tcg-accent font-bold">⚠️ Atenção:</span> Não possuímos loja física para retirada.</p>
                <ul className="text-[11px] sm:text-xs text-gray-400 space-y-1.5 list-disc list-inside">
                  <li>Envios via Correios (frete por conta do comprador).</li>
                  <li>Entrega pessoalmente apenas mediante combinação prévia.</li>
                  <li>Sempre verifique a versão do produto que você está tentando comprar.</li>
                  <li>Consulte no contato a disponibilidade real do produto.</li>
                </ul>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Simular Frete</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Digite seu CEP" value={cep} onChange={(e) => setCep(e.target.value)} className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-tcg-primary transition-colors" />
                  <button onClick={handleCalculateShipping} disabled={isLoadingCep} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shrink-0">
                    {isLoadingCep ? '...' : 'Calcular'}
                  </button>
                </div>
                {shippingInfo && (
                  <div className="mt-3 text-xs sm:text-sm bg-black/30 p-3 sm:p-4 rounded-xl border border-white/5">
                    <p className="text-gray-300 mb-2">Envio para <strong className="text-white">{shippingInfo.city} - {shippingInfo.state}</strong></p>
                    <div className="flex justify-between items-center py-1.5 border-b border-white/5"><span className="text-gray-400">PAC (Simulado)</span><strong className="text-white">R$ {shippingInfo.pac.toFixed(2).replace('.', ',')}</strong></div>
                    <div className="flex justify-between items-center py-1.5 pt-2"><span className="text-gray-400">Sedex (Simulado)</span><strong className="text-white">R$ {shippingInfo.sedex.toFixed(2).replace('.', ',')}</strong></div>
                  </div>
                )}
              </div>
              
              <div className="mt-auto flex flex-col gap-2.5 sm:gap-3 pt-2">
                <button 
                  onClick={() => addToCart(selectedProduct)} 
                  disabled={selectedProduct.stock === 0}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 flex justify-center items-center gap-2 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🛒 Adicionar ao Carrinho
                </button>
                <button 
                  onClick={handleWhatsAppCheckout} 
                  disabled={selectedProduct.stock === 0}
                  className="w-full bg-tcg-primary hover:bg-tcg-glow shadow-neon text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:-translate-y-1 flex justify-center items-center gap-2 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Comprar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto border-t border-white/10 bg-black/40 pt-16 pb-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('Home', 'Todos'); }} className="text-3xl font-black tracking-tighter text-white opacity-50 hover:opacity-100 transition-opacity mb-6">
            GORDÃO <span className="text-tcg-primary">CARTAS</span>
          </a>
          
          <p className="text-gray-500 text-sm mb-8 max-w-lg leading-relaxed">
            Imagens utilizadas neste site têm seus direitos reservados aos seus devidos proprietários. 
            Este é um projeto de e-commerce criado de colecionador para colecionador.
          </p>

          <a href="https://wa.me/5583998268170" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:border-tcg-primary hover:text-white transition-all text-gray-300 font-bold mb-12 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.004-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
            </svg>
            Fale Conosco pelo WhatsApp
          </a>

          <div className="text-xs text-gray-600 font-medium">
            &copy; 2026 Gordão Cartas. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App