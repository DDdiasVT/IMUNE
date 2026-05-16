# Cristina OS - Marketing Operational System

Um sistema interno premium desenvolvido para agências de marketing que buscam excelência operacional.

## 🚀 Tecnologias
- **Next.js 15+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (Animações)
- **Recharts** (Métricas)
- **Supabase** (Banco de dados e Auth)
- **Lucide React** (Ícones)

## 📦 Estrutura do Projeto
- `src/app`: Rotas e páginas (Dashboard, CRM, Conteúdo, Tarefas, Calendário, Métricas, Wiki).
- `src/components`: Componentes de UI reutilizáveis e layouts.
- `src/lib`: Configurações do Supabase e utilitários.
- `src/types`: Definições de tipos TypeScript.

## 🛠️ Configuração Inicial
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env.local` com suas credenciais do Supabase.
3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🗄️ Banco de Dados
O schema do banco de dados está disponível no arquivo `supabase_schema.sql` na pasta de artefatos da conversa. Basta executá-lo no editor SQL do seu projeto Supabase.

## ✨ Design System
O sistema utiliza uma paleta de cores moderna (Slate/Zinc) com um modo escuro elegante (Dark Mode) por padrão. As fontes e espaçamentos foram inspirados em ferramentas como Linear e Stripe Dashboard.
