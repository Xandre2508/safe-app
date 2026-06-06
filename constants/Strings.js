// constants/Strings.js

export const Strings = {
  // --- GERAL ---
  appName: "S.A.F.E. LOGO",
  error: "Erro",
  success: "Sucesso",
  wait: "Aguarde",
  logout: "Sair / Voltar ao Login",
  permissionDeniedTitle: "Permissão Negada",
  
  // --- LOGIN E REGISTO ---
  login: {
    tabLogin: "Login",
    tabRegister: "Registo",
    emailLabel: "Email:",
    emailPlaceholder: "Email...",
    nifLabel: "NIF:",
    nifPlaceholder: "NIF...",
    accountTypeLabel: "Tipo de Conta:",
    roleVictim: "Vítima",
    roleRescuer: "Socorrista",
    passwordLabel: "Password:",
    passwordPlaceholder: "Password...",
    repeatPasswordLabel: "Repetir Password:",
    repeatPasswordPlaceholder: "Repetir Password...",
    btnEnter: "Entrar",
    btnCreateAccount: "Criar Conta",
    forgotPassword: "Esqueceu-se da password?",
    simLoginTitle: "Simulação de Login",
    simLoginMessage: "A verificar na Base de Dados... A redirecionar!",
    simRegistoTitle: "Simulação de Registo",
    simRegistoMessage: (role) => `Conta de ${role} criada com sucesso!`
  },

  // --- DASHBOARD VÍTIMA ---
  victim: {
    locationError: "Precisamos da sua localização para que os socorristas o encontrem.",
    locationWait: "A obter a sua localização exata para o resgate...",
    btnSOS: "SOS",
    btnSOSSub: "Pedido Urgente",
    btnSupport: "APOIO",
    btnSupportSub: "Mantimentos",
    sosSentTitle: "🚨 Alerta Enviado!",
    sosSentMessage: "O seu pedido foi enviado com sucesso. Socorristas num raio de 50km estão a ser notificados.",
    sosError: "Não foi possível enviar o alerta. Verifique a sua ligação.",
    supportAlertTitle: "Apoio Humanitário",
    supportAlertMessage: "Funcionalidade de pedido de mantimentos em breve.",
    emergencyStateTitle: "Estado de Emergência: PORTO",
    criticalAlert: "🔥 ALERTA CRÍTICO 🔥",
    fireInfo: "Incêndio ativo a 12km de distância.",
    followInstructions: "Siga as instruções das autoridades.",
    updatesTitle: "Últimas Atualizações:",
    update1: "• Meios de socorro a caminho do setor Norte.",
    update2: "• Condições meteorológicas adversas previstas."
  },

  // --- DASHBOARD SOCORRISTA ---
  rescuer: {
    locationError: "Precisamos da sua localização para o mapa.",
    activeAlertsTitle: "Alerta de Ativos",
    activeAlertsCount: "12 Pendentes",
    currentMissionTitle: "Missão Atual:",
    currentMissionLocation: "Setor Leste",
    priorityRescueTitle: "Resgate Prioritário:",
    priorityRescueLocation: "📍 Rua de Santa Catarina, Porto",
    priorityRescuePerson: "👤 Maria Santos (82 anos)",
    priorityRescueReason: "🔴 Prioridade Máxima - Idade e Fumo",
    tacticalUpdateTitle: "Atualização Tática:",
    tacticalUpdate1: "Bombeiros a 5 minutos do local.",
    tacticalUpdate2: "Vento forte de Noroeste."
  }
};