# Next - Aplicação de Notas Colaborativas

Next é uma aplicação moderna de gerenciamento de notas e documentos, inspirada no Notion, construída com tecnologias web de ponta. Oferece edição em tempo real de Markdown, organização em workspaces e uma interface intuitiva para produtividade.

## ✨ Características

- **📝 Editor Markdown Live**: Edição e visualização em tempo real com sintaxe Markdown
- **🏢 Workspaces**: Organize suas notas em espaços de trabalho separados
- **🔍 Navegação Inteligente**: Sumário automático, navegação entre notas e busca
- **⚡ Performance Otimizada**: Debounce inteligente para salvar automaticamente
- **🎨 Interface Moderna**: Design limpo com ícones Lucide e Tailwind CSS
- **🔐 Autenticação Segura**: Sistema de login com Lucia Auth
- **📱 Responsivo**: Funciona perfeitamente em desktop e dispositivos móveis

## 🛠 Stack Tecnológica

Este projeto utiliza o **[T3 Stack](https://create.t3.gg/)** com as seguintes tecnologias:

- **[Next.js 15](https://nextjs.org)** - Framework React com App Router
- **[TypeScript](https://typescriptlang.org)** - Tipagem estática
- **[tRPC](https://trpc.io)** - APIs type-safe end-to-end
- **[Drizzle ORM](https://orm.drizzle.team)** - ORM TypeScript-first
- **[PostgreSQL](https://postgresql.org)** - Banco de dados relacional
- **[Tailwind CSS](https://tailwindcss.com)** - Framework CSS utilitário
- **[Lucia Auth](https://lucia-auth.com)** - Autenticação simples e segura
- **[Lucide React](https://lucide.dev)** - Ícones SVG modernos
- **[React Markdown](https://github.com/remarkjs/react-markdown)** - Renderização de Markdown

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ e npm
- PostgreSQL 12+
- Git

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/rbxyz/next.git
   cd next
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/next"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. **Configure o banco de dados**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

6. **Abra no navegador**
   
   Acesse [http://localhost:3000](http://localhost:3000)

## 📋 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run db:studio` - Abre o Drizzle Studio
- `npm run db:push` - Aplica mudanças no schema
- `npm run db:generate` - Gera migrações
- `npm run db:seed` - Popula o banco com dados iniciais
- `npm run typecheck` - Verifica tipos TypeScript
- `npm run check` - Executa linter (Biome)

## 🎯 Funcionalidades

### Editor de Markdown
- Edição e preview em tempo real
- Atalhos de teclado (Ctrl+B, Ctrl+I, etc.)
- Auto-continuação de listas e citações
- Suporte a GFM (GitHub Flavored Markdown)

### Organização
- Workspaces para separar projetos
- Navegação entre notas com setas
- Sumário automático com links para seções
- Contador de palavras e progresso

### Interface
- Sidebar retrátil com lista de notas
- Status de salvamento em tempo real
- Ícones consistentes e modernos
- Design responsivo

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Desenvolvimento

- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Mantenha o código bem documentado
- Use commits semânticos

## 📄 Licença

Este projeto está licenciado sob a **Apache License 2.0** - veja o arquivo [LICENSE](LICENSE) para detalhes.

### Apache License 2.0

A Apache License 2.0 é uma licença permissiva que permite:

- ✅ Uso comercial
- ✅ Modificação
- ✅ Distribuição
- ✅ Uso privado
- ✅ Uso de patentes

**Condições:**
- Incluir aviso de copyright
- Incluir texto da licença
- Documentar mudanças significativas

## 🙏 Reconhecimentos

- [T3 Stack](https://create.t3.gg/) pela base sólida do projeto
- [Vercel](https://vercel.com) pelos serviços de hosting
- [Lucide](https://lucide.dev) pelos ícones modernos
- Comunidade open source pelas ferramentas incríveis

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

- 🐛 [Abra uma issue](https://github.com/rbxyz/next/issues)
- 💬 [Discussões](https://github.com/rbxyz/next/discussions)
- 📧 Email: rbcr4z1@gmail.com

---

**Feito com ☕ usando T3 Stack**
