# 🃏 Gordão Cartas - TCG E-Commerce MVP

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Open Source](https://img.shields.io/badge/Open_Source-%E2%99%A5-red?style=for-the-badge)

Bem-vindo ao repositório do **Gordão Cartas**, um projeto MVP (Minimum Viable Product) de e-commerce focado em lojas de colecionismo e Trading Card Games (TCG) como Pokémon, Magic, Yu-Gi-Oh!, entre outros.

O projeto possui um visual *Premium* focado em UI/UX moderna (estilo *Glassmorphism*), navegação fluida em Single Page Application (SPA) e finalização de compras direta pelo WhatsApp. Em breve iremos atualizar para uma versão com banco de dados, cadastro de clientes e produtos otímizado, etc. Evoluções virão.

## ✨ Funcionalidades
- **Catálogo Dinâmico:** Produtos carregados automaticamente via arquivo JSON local (`src/data/products.json`).
- **Sistema de Busca:** Pesquisa centralizada em tempo real por nome, expansão ou jogo.
- **Navegação SPA & Histórico:** Transições rápidas de tela sem recarregar a página e integração completa com os botões de voltar/avançar nativos do navegador.
- **Integração ViaCEP:** Simulação de frete (PAC/Sedex) puxando a cidade e estado do cliente.
- **Check-out Inteligente via WhatsApp:** O sistema formata o pedido completo (com valor, simulação de frete e CEP) e abre direto no WhatsApp do vendedor.
- **Carrossel Infinito Duplo:** Exposição contínua e sem quebras das "Cartas Avulsas" na Home.
- **Responsividade Pura:** Menu Hamburger elegante para dispositivos móveis, adaptando-se perfeitamente a qualquer tamanho de tela.

## 🚀 Como rodar o projeto localmente

1. Faça o clone do repositório:
```bash
git clone https://github.com/SeuUsuario/gordaocartas-mvp.git
```

2. Acesse a pasta do projeto:
```bash
cd gordaocartas-mvp
```

3. Instale as dependências:
```bash
npm install
```

4. Inicie o servidor local:
```bash
npm run dev
```

## 🛠️ Personalizando sua Loja (Open Source)

Este projeto é **100% Open Source**! 

Se você quer criar a sua própria loja de TCG, sinta-se livre para fazer um *Fork* deste repositório, personalizar as cores (no arquivo `tailwind.config.js`) e cadastrar os seus produtos reais apenas editando o arquivo `src/data/products.json`. 

Incentivamos que a comunidade utilize essa base para prosperar em seus negócios de colecionismo. Apenas pedimos que **mantenha os créditos** e referências ao repositório original.

## 📄 Licença
Este projeto está sob a Licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. Você tem total liberdade para usar, modificar, desde que os devidos créditos sejam atribuídos.