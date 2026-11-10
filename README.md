# 🚨 S.A.F.E. - Sistema de Apoio e Forças de Emergência

O **S.A.F.E.** é uma aplicação móvel profissional desenvolvida em **React Native** com **Expo** e **Firebase**, concebida para coordenar operações de resgate, assistência a cidadãos em perigo, logística de mantimentos e comunicações táticas de rádio entre operadores de central e socorristas operacionais em tempo real.

O projeto foi totalmente adaptado e otimizado para executar em **dispositivos Android** sem restrições (gestão avançada de permissões de GPS, canais de notificações push Android 8.0+, mapas dinâmicos e suporte a botão físico de voltar).

---

## 🌟 Funcionalidades e Perfis de Utilizador

A aplicação disponibiliza 4 perfis distintos com roteamento automático baseado em funções (`roles`):

1. **Cidadão / Vítima (`vitima`)**:
   - Emissão de pedidos de socorro imediato (**SOS**) com geolocalização exata (GPS).
   - Triagem rápida de condições prioritárias (gravidez, crianças, idade).
   - Pedidos de apoio humanitário e **mantimentos** (água, alimentos, agasalhos).
   - Chat tático bidirecional em tempo real com o Operador de Central.
   - Histórico de ocorrências com filtros por estado (`pendente`, `concluido`, `cancelado`).
   - Feed de notícias e comunicados da Proteção Civil.

2. **Socorrista Operacional (`socorrista`)**:
   - Visualização em mapa interativo das ocorrências num raio de 60 km.
   - Algoritmo inteligente de priorização de missões por gravidade e distância geodésica (fórmula de Haversine).
   - Traçado de rotas e coordenadas geográficas da vítima.
   - Painel deslizante (*Bottom Sheet*) integrado.
   - Comunicação rádio em tempo real com a Central de Operações.
   - Encerramento de missões após conclusão do socorro.

3. **Operador de Central (`operador`)**:
   - Monitorização simultânea de alertas de SOS e pedidos de mantimentos.
   - Gestão de solicitações de cancelamento enviadas por cidadãos.
   - Rádio tático com todos os socorristas operacionais ativos na rede.
   - Notificações locais imediatas para mensagens críticas.

4. **Administrador de Organização (`organizacao`)**:
   - Gestão de colaboradores operacionais (criação de contas para Socorristas e Operadores).
   - Vínculo institucional automático de cada operacional à Organização do Administrador.
   - Criação segura de utilizadores através de instância secundária do Firebase (evitando a perda de sessão do Admin).

---

## 📱 Otimizações e Compatibilidade Android

- **Permissões Nativas**: Configuração completa em `app.json` para `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `FOREGROUND_SERVICE`, `POST_NOTIFICATIONS` e `CAMERA`.
- **Canais de Notificação Android (Notification Channels)**: Inicialização dos canais `emergency_alerts` e `radio_messages` garantindo som, vibração e banners em Android 8.0 até Android 15+.
- **Botão Físico de Voltar (Hardware BackHandler)**: Tratamento nativo do botão de retroceder em todos os ecrãs (recolher painéis/chats antes de sair).
- **Mapas com Fallback Offline**: Traçado vetorial no mapa sem dependência obrigatória de chaves pagas da Directions API.
- **Áreas Seguras (Safe Area Insets)**: Suporte a dispositivos Android com entalhes (*notches*), câmaras *punch-hole* e navegação por gestos de ecrã inteiro.
- **Teclado sem Glitches**: `KeyboardAvoidingView` calibrado para o modo de redimensionamento nativo do Android.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: React Native 0.81 & Expo 54
- **Linguagem**: JavaScript (ES6+) e TypeScript
- **Navegação**: React Navigation (Stack Navigator & Gesture Handler Root)
- **Base de Dados & Auth**: Firebase v12 (Firestore em tempo real & Firebase Authentication com persistência AsyncStorage)
- **Componentes Nativos**:
  - `react-native-maps` & `react-native-maps-directions`
  - `@gorhom/bottom-sheet` & `react-native-gesture-handler`
  - `expo-location` & `expo-notifications`
  - `expo-image-picker` & `expo-status-bar`
  - `react-native-safe-area-context`

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- **Node.js** (v18+ ou v20+)
- **npm** ou **yarn**
- Dispositivo Android com **Expo Go** instalado ou Emulador Android Studio

### 2. Instalação de Dependências
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente
O projeto já inclui credenciais funcionais integradas por defeito. Se desejar personalizar, copie o ficheiro de exemplo:
```bash
cp .env.example .env
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm start
```
- Pressione `a` para abrir no emulador Android conectado.
- Ou leia o QR Code gerado através da aplicação **Expo Go** no seu smartphone Android.

### 5. Compilar APK Nativo com EAS Build
Para gerar um pacote APK autónomo sem restrições para qualquer telemóvel Android:
```bash
npx eas-cli build -p android --profile preview
```

---

## 📄 Licença e Propriedade
Projeto desenvolvido no âmbito do sistema de socorro tático S.A.F.E. Todos os direitos reservados.
