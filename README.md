# CAVA | Intelligent Stone Inventory & Sales Platform

![Project Status](https://img.shields.io/badge/Status-Prototyping_Phase-orange)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_TypeScript_|_Tailwind-blue)

## 🪨 Sobre o Projeto

O **CAVA** é uma plataforma SaaS B2B desenvolvida para transformar a gestão e comercialização de rochas ornamentais. O sistema atua como um hub central que conecta o **Inventário da Indústria** a uma rede de **Vendedores Externos** através de links de venda dinâmicos, substituindo processos manuais por um fluxo digital auditável e inteligente.

O diferencial técnico reside na arquitetura focada em UX mobile para a força de vendas e na lógica de precificação dinâmica com travas de segurança (Floor Price).

---

## Funcionalidades Principais

### Módulo Indústria (Admin)
- [cite_start]**Gestão de Catálogo & Inventário:** Cadastro de chapas com dimensões, fotos e tipologia[cite: 12, 13].
- **Delegação de Vendas:** Atribuição de itens de estoque para vendedores específicos com definição de **Preço Mínimo (Custo)**.
- **Dashboard Executiva:** KPIs de faturamento, margem de lucro e monitoramento de links ativos em tempo real.
- [cite_start]**Controle de Status:** Fluxo visual de estados: *Disponível* → *Em Negociação* → *Vendido*[cite: 40].

### Módulo Vendedor (Mobile-First)
- **Wizard de Ofertas:** Interface otimizada para celular onde o vendedor cria links personalizados.
- **Precificação Dinâmica:** O vendedor define sua margem acima do preço base da indústria.
- **Gestão de Links:** Monitoramento de visualizações e status das propostas enviadas aos clientes.

### Módulo Cliente Final (Vitrine)
- [cite_start]**Visualização Imersiva:** Apresentação de alta fidelidade da rocha (Zoom, Detalhes Técnicos)[cite: 36].
- **Reserva Simplificada:** Call-to-Action direto para negociação via WhatsApp com o vendedor responsável.

---

## Tech Stack & Arquitetura

O projeto segue os princípios da **Clean Architecture (Pragmatic)** para garantir desacoplamento entre UI e Regras de Negócio.

- **Core:** React 19, TypeScript, Vite.
- **Estilização:** Tailwind CSS (Shadcn/UI Design System).
- **Gerenciamento de Estado:** React Hooks (Custom Hooks para Application Layer).
- **Visualização de Dados:** Recharts (Dashboards Responsivas).
- **Iconografia:** Lucide React.
