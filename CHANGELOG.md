# Histórico de Versões

Todas as novidades, melhorias e correções do BusKá são registradas aqui.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0-beta] — 2026-04-11

### Novidades

- **Tela de splash animada** — Nova splash screen com animações de fade, escala e deslizamento ao iniciar o aplicativo
- **Consentimento do responsável** — Fluxo dedicado para autorização de cadastro de alunos menores: responsável recebe link, visualiza os dados do estudante e concede ou recusa a autorização antes da análise do gestor
- **Reporte de ocorrências** — Bottom sheet `ReportSheet` com chips de categoria (atraso, lotação, comportamento, cancelamento) para registro rápido de problemas durante viagens, disponível para alunos e motoristas
- **Banner de alertas de viagem** — Componente `TripAlertBanner` com animação de entrada/saída e auto-dismiss para exibir avisos contextuais de viagem sem bloquear a tela
- **Aprovação de cadastros pelo gestor** — Tela de detalhe do aluno agora exibe o status `AGUARDANDO APROVAÇÃO` e permite que gestores aprovem cadastros com um toque, notificando o aluno automaticamente
- **Motorista: avisos e reporte durante viagem** — Durante viagens ativas o motorista pode enviar mensagens pré-definidas aos alunos e reportar problemas com categoria selecionável, sem necessidade de digitar
- **Mapa de rota estático** — Novo componente `StaticRouteMap` para visualização da rota sem interatividade, usado em telas de detalhe de viagem

### Melhorias

- `InicioFimViagem` remodelado com princípios de segurança para motoristas: controles flutuantes, botões de ação muito maiores (mín. 72 dp) e bloqueio do botão voltar durante viagens ativas
- Componentes de mapa reorganizados em `features/map` com variantes nativas e web separadas (`LocationMap`, `RouteMap`, `StaticRouteMap`, `MapPointPicker`)
- `AuthContext` atualizado para tratar o novo status `PENDING_APPROVAL` e o fluxo de cadastro de alunos menores

---

## [0.1.1-beta] — 2026-03-15

### Melhorias

- Ícone do aplicativo atualizado com a identidade visual oficial do BusKá

---

## [0.1.0-beta] — 2026-03-14

### Novidades

- **Autenticação** — Login, cadastro passo a passo com campos de endereço e recuperação de senha
- **Navegação por perfil** — Fluxos distintos para alunos, motoristas e gestores
- **Sistema de design** — Tema BusKá com tokens de design, fonte Inter e ícones Material em Android e web
- **Gestão de rotas** — Gestores podem criar rotas, definir pontos de parada com mapa interativo e atribuir motoristas
- **Gestão de viagens** — Gestores programam viagens com horários; motoristas iniciam e encerram pelo aplicativo
- **Localização do ônibus** — Alunos acompanham a localização do ônibus em tempo real no mapa
- **Envio de localização do motorista** — Coordenadas GPS do motorista são enviadas continuamente ao servidor durante viagens ativas
- **Confirmação de presença** — Alunos confirmam presença nas viagens pelo painel
- **Notificações push** — Integração com Firebase Cloud Messaging para atualizações de rotas e viagens
- **Preenchimento automático por CEP** — Endereço preenchido automaticamente ao digitar o CEP no cadastro
- **Notificações in-app** — Sistema de feedback para ações, erros e estados assíncronos
- **Tratamento de erros** — Erros de validação do servidor exibidos diretamente nos campos do formulário

### Infraestrutura

- Runner próprio no GitHub Actions para builds Android
- Geração automática de APK assinado com keystore gerenciada via GitHub Secrets
- Workflows separados para builds (a cada push) e criação de release (via tags `v*`)
- GitHub Release criado automaticamente com APK anexado ao enviar uma tag
- Notificações Discord para eventos de build e release