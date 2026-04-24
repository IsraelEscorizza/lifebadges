import { PrismaClient, AchievementCategory, AchievementRarity } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertPack(data: {
  slug: string; name: string; description: string; icon: string;
  color: string; isBase: boolean; price: number; sortOrder: number;
}) {
  return prisma.achievementPack.upsert({
    where: { slug: data.slug },
    update: {},
    create: data,
  });
}

async function upsertAchievements(packId: string, achievements: Array<{
  slug: string; name: string; description: string; icon: string;
  category: AchievementCategory; rarity: AchievementRarity; sortOrder: number;
}>) {
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { packId_slug: { packId, slug: ach.slug } },
      update: {},
      create: { ...ach, packId },
    });
  }
}

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // ─────────────────────────────────────────────────────────────────────────
  // PACK 1 — MARCOS DA VIDA (base, gratuito)
  // ─────────────────────────────────────────────────────────────────────────
  const pack1 = await upsertPack({
    slug: "marcos-da-vida", name: "Marcos da Vida",
    description: "As grandes conquistas que marcam a sua jornada de vida — do nascimento à aposentadoria.",
    icon: "🏆", color: "#f59e0b", isBase: true, price: 0, sortOrder: 1,
  });

  await upsertAchievements(pack1.id, [
    { slug: "bem-vindo",                      name: "Bem-vindo ao LifeBadges!",       description: "Fez o primeiro login e começou a jornada de conquistas.",            icon: "🎉", category: AchievementCategory.PERSONAL,      rarity: AchievementRarity.COMMON,    sortOrder: 0  },
    { slug: "primeiro-dia-escola",         name: "Primeiro Dia de Escola",        description: "Deu o primeiro passo na educação formal.",                        icon: "🎒", category: AchievementCategory.EDUCATION,     rarity: AchievementRarity.COMMON,    sortOrder: 1  },
    { slug: "formatura-ensino-fundamental", name: "Formatura — Ensino Fundamental", description: "Concluiu o ensino fundamental com sucesso.",                     icon: "📗", category: AchievementCategory.EDUCATION,     rarity: AchievementRarity.COMMON,    sortOrder: 2  },
    { slug: "formatura-ensino-medio",       name: "Formatura — Ensino Médio",       description: "Recebeu o diploma do ensino médio!",                             icon: "🎓", category: AchievementCategory.EDUCATION,     rarity: AchievementRarity.UNCOMMON,  sortOrder: 3  },
    { slug: "primeiro-emprego",             name: "Primeiro Emprego",               description: "Assinou a carteira pela primeira vez.",                          icon: "💼", category: AchievementCategory.CAREER,        rarity: AchievementRarity.UNCOMMON,  sortOrder: 4  },
    { slug: "carta-motorista",              name: "Carta de Motorista",             description: "Passou no exame e tirou a CNH!",                                 icon: "🪪", category: AchievementCategory.PERSONAL,      rarity: AchievementRarity.UNCOMMON,  sortOrder: 5  },
    { slug: "primeiro-carro",               name: "Primeiro Carro",                 description: "Comprou ou ganhou o seu primeiro carro.",                        icon: "🚗", category: AchievementCategory.PERSONAL,      rarity: AchievementRarity.UNCOMMON,  sortOrder: 6  },
    { slug: "formatura-faculdade",          name: "Formatura — Faculdade",          description: "Colou grau e conquistou o diploma universitário.",               icon: "🏛️", category: AchievementCategory.EDUCATION,     rarity: AchievementRarity.RARE,      sortOrder: 7  },
    { slug: "primeiro-apartamento",         name: "Primeiro Apartamento",           description: "Saiu do ninho e conquistou o seu próprio lar.",                  icon: "🏠", category: AchievementCategory.PERSONAL,      rarity: AchievementRarity.RARE,      sortOrder: 8  },
    { slug: "primeira-viagem-internacional",name: "Primeira Viagem Internacional",  description: "Cruzou fronteiras e explorou outro país.",                       icon: "✈️", category: AchievementCategory.TRAVEL,        rarity: AchievementRarity.RARE,      sortOrder: 9  },
    { slug: "casamento",                    name: "Casamento",                      description: "Disse sim e formalizou a união com a pessoa amada.",             icon: "💍", category: AchievementCategory.RELATIONSHIPS, rarity: AchievementRarity.RARE,      sortOrder: 10 },
    { slug: "primeiro-filho",               name: "Primeiro Filho",                 description: "Tornou-se pai ou mãe pela primeira vez.",                        icon: "👶", category: AchievementCategory.RELATIONSHIPS, rarity: AchievementRarity.EPIC,      sortOrder: 11 },
    { slug: "casa-propria",                 name: "Casa Própria",                   description: "Conquistou o sonho da casa própria.",                            icon: "🏡", category: AchievementCategory.FINANCE,       rarity: AchievementRarity.EPIC,      sortOrder: 12 },
    { slug: "pos-graduacao",                name: "Pós-Graduação",                  description: "Concluiu especialização, mestrado ou doutorado.",                icon: "🔬", category: AchievementCategory.EDUCATION,     rarity: AchievementRarity.EPIC,      sortOrder: 13 },
    { slug: "abriu-empresa",                name: "Empreendedor",                   description: "Abriu seu próprio negócio.",                                     icon: "🚀", category: AchievementCategory.CAREER,        rarity: AchievementRarity.EPIC,      sortOrder: 14 },
    { slug: "primeiro-neto",                name: "Avô/Avó",                        description: "Recebeu o título mais especial da vida.",                        icon: "👴", category: AchievementCategory.RELATIONSHIPS, rarity: AchievementRarity.EPIC,      sortOrder: 15 },
    { slug: "aposentadoria",                name: "Aposentadoria",                  description: "Encerrou a carreira profissional com chave de ouro.",             icon: "🌅", category: AchievementCategory.CAREER,        rarity: AchievementRarity.LEGENDARY, sortOrder: 16 },
    { slug: "bodas-ouro",                   name: "Bodas de Ouro",                  description: "50 anos de união. Uma raridade lendária.",                       icon: "💛", category: AchievementCategory.RELATIONSHIPS, rarity: AchievementRarity.LEGENDARY, sortOrder: 17 },
    { slug: "fundador-de-grupo",            name: "Fundador de Grupo",              description: "Criou seu próprio grupo de conquistas no LifeBadges.",             icon: "👑", category: AchievementCategory.PERSONAL,      rarity: AchievementRarity.RARE,      sortOrder: 18 },
    { slug: "membro-de-grupo",              name: "Membro de Grupo",                description: "Entrou em um grupo e começou a competir com amigos.",              icon: "🤝", category: AchievementCategory.PERSONAL,      rarity: AchievementRarity.COMMON,    sortOrder: 19 },
    { slug: "lider-da-turma",               name: "Líder da Turma",                 description: "Ficou em 1º lugar no ranking de um grupo.",                        icon: "🥇", category: AchievementCategory.PERSONAL,      rarity: AchievementRarity.EPIC,      sortOrder: 20 },
  ]);
  console.log(`✅ Pack "Marcos da Vida" — 20 conquistas`);

  // ─────────────────────────────────────────────────────────────────────────
  // PACK 2 — SAÚDE & BEM-ESTAR
  // ─────────────────────────────────────────────────────────────────────────
  const pack2 = await upsertPack({
    slug: "saude-bem-estar", name: "Saúde & Bem-Estar",
    description: "Para quem cuida do corpo e da mente. Mostre que disciplina é conquista!",
    icon: "💪", color: "#10b981", isBase: false, price: 1.99, sortOrder: 2,
  });

  await upsertAchievements(pack2.id, [
    { slug: "academia-30-dias",    name: "30 Dias de Academia",      description: "Treinou 30 dias consecutivos sem faltar.",          icon: "🏋️", category: AchievementCategory.HEALTH, rarity: AchievementRarity.COMMON,    sortOrder: 1  },
    { slug: "academia-100-dias",   name: "100 Dias de Academia",     description: "Cem dias de treino. Disciplina pura!",              icon: "💎", category: AchievementCategory.HEALTH, rarity: AchievementRarity.RARE,      sortOrder: 2  },
    { slug: "corrida-5k",          name: "Primeira Corrida 5K",      description: "Completou 5 quilômetros correndo.",                 icon: "🏃", category: AchievementCategory.HEALTH, rarity: AchievementRarity.COMMON,    sortOrder: 3  },
    { slug: "corrida-10k",         name: "Corrida 10K",              description: "Cruzou a linha dos 10 km.",                        icon: "🏅", category: AchievementCategory.HEALTH, rarity: AchievementRarity.UNCOMMON,  sortOrder: 4  },
    { slug: "meia-maratona",       name: "Meia Maratona",            description: "Completou 21 km — isso é determinação!",           icon: "🥈", category: AchievementCategory.HEALTH, rarity: AchievementRarity.RARE,      sortOrder: 5  },
    { slug: "maratona",            name: "Maratona Completa",        description: "42,195 km. Simplesmente lendário.",                icon: "🥇", category: AchievementCategory.HEALTH, rarity: AchievementRarity.LEGENDARY, sortOrder: 6  },
    { slug: "parou-fumar",         name: "Livre do Cigarro",         description: "Parou de fumar. Um presente enorme para a saúde.", icon: "🚭", category: AchievementCategory.HEALTH, rarity: AchievementRarity.EPIC,      sortOrder: 7  },
    { slug: "perdeu-10kg",         name: "Perdeu 10kg",              description: "Perdeu 10 quilos de forma saudável.",              icon: "⚖️", category: AchievementCategory.HEALTH, rarity: AchievementRarity.RARE,      sortOrder: 8  },
    { slug: "perdeu-20kg",         name: "Perdeu 20kg",              description: "Transformação incrível! 20 kg a menos.",          icon: "🔥", category: AchievementCategory.HEALTH, rarity: AchievementRarity.EPIC,      sortOrder: 9  },
    { slug: "meditacao-30-dias",   name: "30 Dias Meditando",        description: "Praticou meditação por 30 dias consecutivos.",     icon: "🧘", category: AchievementCategory.HEALTH, rarity: AchievementRarity.UNCOMMON,  sortOrder: 10 },
    { slug: "vegetariano-1-ano",   name: "1 Ano Vegetariano",        description: "Ficou um ano sem comer carne.",                   icon: "🥗", category: AchievementCategory.HEALTH, rarity: AchievementRarity.RARE,      sortOrder: 11 },
    { slug: "parou-beber",         name: "Sóbrio por 1 Ano",         description: "Um ano sem álcool. Força e consciência.",         icon: "🚱", category: AchievementCategory.HEALTH, rarity: AchievementRarity.EPIC,      sortOrder: 12 },
    { slug: "triathlon",           name: "Triathlon",                description: "Nadou, pedalou e correu. Guerreiro.",             icon: "🏊", category: AchievementCategory.HEALTH, rarity: AchievementRarity.LEGENDARY, sortOrder: 13 },
    { slug: "yoga-6-meses",        name: "6 Meses de Yoga",          description: "Praticou yoga por 6 meses seguidos.",             icon: "🧘", category: AchievementCategory.HEALTH, rarity: AchievementRarity.UNCOMMON,  sortOrder: 14 },
    { slug: "doou-sangue",         name: "Doador de Sangue",         description: "Doou sangue e salvou vidas.",                     icon: "🩸", category: AchievementCategory.HEALTH, rarity: AchievementRarity.COMMON,    sortOrder: 15 },
    { slug: "doou-sangue-10x",     name: "Doador Frequente",         description: "Doou sangue 10 vezes ou mais. Herói!",            icon: "❤️", category: AchievementCategory.HEALTH, rarity: AchievementRarity.EPIC,      sortOrder: 16 },
  ]);
  console.log(`✅ Pack "Saúde & Bem-Estar" — 16 conquistas`);

  // ─────────────────────────────────────────────────────────────────────────
  // PACK 3 — AVENTURAS & VIAGENS
  // ─────────────────────────────────────────────────────────────────────────
  const pack3 = await upsertPack({
    slug: "aventuras-viagens", name: "Aventuras & Viagens",
    description: "Para quem coleciona passaportes, trilhas e experiências ao redor do mundo.",
    icon: "🌍", color: "#3b82f6", isBase: false, price: 1.99, sortOrder: 3,
  });

  await upsertAchievements(pack3.id, [
    { slug: "primeiro-voo",            name: "Primeiro Voo",               description: "Voou pela primeira vez na vida.",                        icon: "✈️", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.COMMON,    sortOrder: 1  },
    { slug: "visitou-5-estados",       name: "5 Estados Brasileiros",      description: "Visitou 5 estados do Brasil.",                           icon: "🗺️", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.COMMON,    sortOrder: 2  },
    { slug: "visitou-todos-estados",   name: "Todos os Estados",           description: "Visitou todos os 26 estados + DF do Brasil.",            icon: "🇧🇷", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.LEGENDARY, sortOrder: 3  },
    { slug: "visitou-5-paises",        name: "5 Países",                   description: "Visitou pelo menos 5 países diferentes.",               icon: "🌐", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.UNCOMMON,  sortOrder: 4  },
    { slug: "visitou-20-paises",       name: "20 Países",                  description: "Um viajante de verdade! 20 países no passaporte.",       icon: "🛂", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.EPIC,      sortOrder: 5  },
    { slug: "morou-exterior",          name: "Morou no Exterior",          description: "Viveu em outro país por pelo menos 3 meses.",            icon: "🏳️", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.EPIC,      sortOrder: 6  },
    { slug: "mochilao-solo",           name: "Mochilão Solo",              description: "Fez uma viagem sozinho de mochila.",                     icon: "🎒", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.RARE,      sortOrder: 7  },
    { slug: "subiu-montanha",          name: "Alpinista",                  description: "Escalou uma montanha ou chegou a um pico.",              icon: "⛰️", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.RARE,      sortOrder: 8  },
    { slug: "cruzeiro",                name: "Viagem de Cruzeiro",         description: "Fez uma viagem de cruzeiro.",                            icon: "🚢", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.UNCOMMON,  sortOrder: 9  },
    { slug: "mergulho",                name: "Primeiro Mergulho",          description: "Mergulhou e viu o mundo subaquático.",                   icon: "🤿", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.UNCOMMON,  sortOrder: 10 },
    { slug: "safari",                  name: "Safari",                     description: "Fez um safari e viu animais selvagens.",                 icon: "🦁", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.RARE,      sortOrder: 11 },
    { slug: "todos-continentes",       name: "Todos os Continentes",       description: "Pisou nos 7 continentes do mundo.",                      icon: "🗺️", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.LEGENDARY, sortOrder: 12 },
    { slug: "camping-selvagem",        name: "Camping Selvagem",           description: "Dormiu acampado em meio à natureza.",                    icon: "⛺", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.UNCOMMON,  sortOrder: 13 },
    { slug: "paraquedismo",            name: "Paraquedismo",               description: "Saltou de paraquedas e sentiu a liberdade.",             icon: "🪂", category: AchievementCategory.TRAVEL, rarity: AchievementRarity.RARE,      sortOrder: 14 },
  ]);
  console.log(`✅ Pack "Aventuras & Viagens" — 14 conquistas`);

  // ─────────────────────────────────────────────────────────────────────────
  // PACK 4 — CARREIRA & DINHEIRO
  // ─────────────────────────────────────────────────────────────────────────
  const pack4 = await upsertPack({
    slug: "carreira-dinheiro", name: "Carreira & Dinheiro",
    description: "Conquistas profissionais e financeiras que mostram sua evolução.",
    icon: "💰", color: "#8b5cf6", isBase: false, price: 1.99, sortOrder: 4,
  });

  await upsertAchievements(pack4.id, [
    { slug: "primeiro-salario",        name: "Primeiro Salário",           description: "Recebeu o primeiro pagamento da carreira.",              icon: "💵", category: AchievementCategory.CAREER,  rarity: AchievementRarity.COMMON,    sortOrder: 1  },
    { slug: "promocao",                name: "Primeira Promoção",          description: "Foi promovido no trabalho.",                             icon: "📈", category: AchievementCategory.CAREER,  rarity: AchievementRarity.UNCOMMON,  sortOrder: 2  },
    { slug: "geriu-equipe",            name: "Líder de Equipe",            description: "Assumiu a liderança de uma equipe.",                    icon: "👔", category: AchievementCategory.CAREER,  rarity: AchievementRarity.RARE,      sortOrder: 3  },
    { slug: "virou-clt",               name: "CLT Assinada",               description: "Conseguiu emprego com carteira assinada.",               icon: "📋", category: AchievementCategory.CAREER,  rarity: AchievementRarity.COMMON,    sortOrder: 4  },
    { slug: "virou-pj",                name: "Virou PJ",                   description: "Abriu CNPJ e trabalha como pessoa jurídica.",            icon: "🏢", category: AchievementCategory.CAREER,  rarity: AchievementRarity.UNCOMMON,  sortOrder: 5  },
    { slug: "primeiro-cliente",        name: "Primeiro Cliente",           description: "Fechou o primeiro cliente para seu negócio.",            icon: "🤝", category: AchievementCategory.CAREER,  rarity: AchievementRarity.UNCOMMON,  sortOrder: 6  },
    { slug: "faturou-100k",            name: "R$ 100.000 Faturados",       description: "Seu negócio ou carreira atingiu R$100k.",               icon: "💎", category: AchievementCategory.FINANCE, rarity: AchievementRarity.RARE,      sortOrder: 7  },
    { slug: "reserva-emergencia",      name: "Reserva de Emergência",      description: "Guardou 6 meses de gastos como reserva.",               icon: "🏦", category: AchievementCategory.FINANCE, rarity: AchievementRarity.UNCOMMON,  sortOrder: 8  },
    { slug: "zerou-dividas",           name: "Livre das Dívidas",          description: "Zerou todas as dívidas e começou do zero.",             icon: "✅", category: AchievementCategory.FINANCE, rarity: AchievementRarity.RARE,      sortOrder: 9  },
    { slug: "primeiro-investimento",   name: "Primeiro Investimento",      description: "Aplicou dinheiro na bolsa, CDB ou tesouro.",            icon: "📊", category: AchievementCategory.FINANCE, rarity: AchievementRarity.UNCOMMON,  sortOrder: 10 },
    { slug: "renda-passiva",           name: "Renda Passiva",              description: "Recebe renda sem trabalhar ativamente.",                icon: "🌱", category: AchievementCategory.FINANCE, rarity: AchievementRarity.EPIC,      sortOrder: 11 },
    { slug: "publicou-livro",          name: "Publicou um Livro",          description: "Escreveu e publicou seu próprio livro.",                icon: "📚", category: AchievementCategory.CAREER,  rarity: AchievementRarity.EPIC,      sortOrder: 12 },
    { slug: "palestrante",             name: "Palestrante",                description: "Deu uma palestra em evento ou empresa.",                icon: "🎤", category: AchievementCategory.CAREER,  rarity: AchievementRarity.RARE,      sortOrder: 13 },
  ]);
  console.log(`✅ Pack "Carreira & Dinheiro" — 13 conquistas`);

  // ─────────────────────────────────────────────────────────────────────────
  // PACK 5 — CULTURA & ARTES
  // ─────────────────────────────────────────────────────────────────────────
  const pack5 = await upsertPack({
    slug: "cultura-artes", name: "Cultura & Artes",
    description: "Para quem cria, aprende idiomas, lê muito e se expressa através da arte.",
    icon: "🎨", color: "#ec4899", isBase: false, price: 1.99, sortOrder: 5,
  });

  await upsertAchievements(pack5.id, [
    { slug: "leu-50-livros",           name: "50 Livros Lidos",            description: "Leu 50 livros ao longo da vida.",                       icon: "📖", category: AchievementCategory.ARTS,       rarity: AchievementRarity.RARE,      sortOrder: 1  },
    { slug: "leu-100-livros",          name: "100 Livros Lidos",           description: "Cem livros. Um leitor extraordinário.",                 icon: "🗃️", category: AchievementCategory.ARTS,       rarity: AchievementRarity.EPIC,      sortOrder: 2  },
    { slug: "aprendeu-idioma",         name: "Novo Idioma",                description: "Aprendeu um novo idioma até nível conversacional.",     icon: "🌐", category: AchievementCategory.ARTS,       rarity: AchievementRarity.RARE,      sortOrder: 3  },
    { slug: "aprendeu-instrumento",    name: "Aprendeu Instrumento",       description: "Aprendeu a tocar um instrumento musical.",              icon: "🎸", category: AchievementCategory.ARTS,       rarity: AchievementRarity.RARE,      sortOrder: 4  },
    { slug: "exposto-obra",            name: "Exposição de Arte",          description: "Teve obra exposta em galeria ou evento.",               icon: "🖼️", category: AchievementCategory.ARTS,       rarity: AchievementRarity.EPIC,      sortOrder: 5  },
    { slug: "tocou-ao-vivo",           name: "Show ao Vivo",               description: "Se apresentou ao vivo em show ou concerto.",            icon: "🎵", category: AchievementCategory.ARTS,       rarity: AchievementRarity.RARE,      sortOrder: 6  },
    { slug: "publicou-musica",         name: "Publicou Música",            description: "Lançou uma música em plataformas digitais.",            icon: "🎧", category: AchievementCategory.ARTS,       rarity: AchievementRarity.EPIC,      sortOrder: 7  },
    { slug: "curso-online",            name: "Curso Online Completo",      description: "Terminou um curso online do início ao fim.",            icon: "💻", category: AchievementCategory.TECHNOLOGY, rarity: AchievementRarity.COMMON,    sortOrder: 8  },
    { slug: "certificacao-tecnica",    name: "Certificação Técnica",       description: "Obteve uma certificação profissional reconhecida.",     icon: "🏅", category: AchievementCategory.TECHNOLOGY, rarity: AchievementRarity.UNCOMMON,  sortOrder: 9  },
    { slug: "aprendeu-programar",      name: "Aprendeu a Programar",       description: "Criou seu primeiro programa ou site funcional.",        icon: "👨‍💻", category: AchievementCategory.TECHNOLOGY, rarity: AchievementRarity.RARE,      sortOrder: 10 },
    { slug: "teatro",                  name: "No Palco",                   description: "Atuou em peça teatral.",                                icon: "🎭", category: AchievementCategory.ARTS,       rarity: AchievementRarity.UNCOMMON,  sortOrder: 11 },
    { slug: "fotografo",               name: "Fotógrafo",                  description: "Publicou fotos autorais reconhecidas pela comunidade.",  icon: "📸", category: AchievementCategory.ARTS,       rarity: AchievementRarity.UNCOMMON,  sortOrder: 12 },
  ]);
  console.log(`✅ Pack "Cultura & Artes" — 12 conquistas`);

  // ─────────────────────────────────────────────────────────────────────────
  // PACK 6 — ESPORTES & ADRENALINA
  // ─────────────────────────────────────────────────────────────────────────
  const pack6 = await upsertPack({
    slug: "esportes-adrenalina", name: "Esportes & Adrenalina",
    description: "Para quem vive pelo esporte e ama superar limites.",
    icon: "⚽", color: "#ef4444", isBase: false, price: 1.99, sortOrder: 6,
  });

  await upsertAchievements(pack6.id, [
    { slug: "primeiro-gol",            name: "Primeiro Gol",               description: "Marcou seu primeiro gol em jogo oficial.",              icon: "⚽", category: AchievementCategory.SPORTS, rarity: AchievementRarity.COMMON,    sortOrder: 1  },
    { slug: "cinturao-jiu-jitsu",      name: "Faixa Nova — Jiu-Jitsu",     description: "Conquistou nova faixa nas artes marciais.",             icon: "🥋", category: AchievementCategory.SPORTS, rarity: AchievementRarity.UNCOMMON,  sortOrder: 2  },
    { slug: "campeonato-local",        name: "Campeão Local",              description: "Venceu torneio ou campeonato da cidade/bairro.",        icon: "🥇", category: AchievementCategory.SPORTS, rarity: AchievementRarity.UNCOMMON,  sortOrder: 3  },
    { slug: "campeonato-estadual",     name: "Campeão Estadual",           description: "Venceu campeonato estadual em qualquer modalidade.",   icon: "🏆", category: AchievementCategory.SPORTS, rarity: AchievementRarity.RARE,      sortOrder: 4  },
    { slug: "campeonato-nacional",     name: "Campeão Nacional",           description: "Representou e venceu em nível nacional.",              icon: "🎖️", category: AchievementCategory.SPORTS, rarity: AchievementRarity.EPIC,      sortOrder: 5  },
    { slug: "ciclismo-100km",          name: "Ciclismo 100km",             description: "Pedalou 100 km em uma única saída.",                   icon: "🚴", category: AchievementCategory.SPORTS, rarity: AchievementRarity.RARE,      sortOrder: 6  },
    { slug: "natacao-1km",             name: "Nadou 1km",                  description: "Nadou 1 quilômetro sem parar.",                        icon: "🏊", category: AchievementCategory.SPORTS, rarity: AchievementRarity.UNCOMMON,  sortOrder: 7  },
    { slug: "escalada-indoor",         name: "Escalada Indoor",            description: "Completou uma via de escalada indoor.",                icon: "🧗", category: AchievementCategory.SPORTS, rarity: AchievementRarity.COMMON,    sortOrder: 8  },
    { slug: "surfe-primeira-onda",     name: "Surfou a Primeira Onda",     description: "Ficou em pé na prancha e surfou.",                    icon: "🏄", category: AchievementCategory.SPORTS, rarity: AchievementRarity.UNCOMMON,  sortOrder: 9  },
    { slug: "ski-snowboard",           name: "Ski ou Snowboard",           description: "Desceu uma pista de neve.",                           icon: "⛷️", category: AchievementCategory.SPORTS, rarity: AchievementRarity.RARE,      sortOrder: 10 },
    { slug: "boxe-sparring",           name: "Primeiro Sparring",          description: "Entrou no ringue e fez seu primeiro sparring.",        icon: "🥊", category: AchievementCategory.SPORTS, rarity: AchievementRarity.UNCOMMON,  sortOrder: 11 },
    { slug: "100-flexoes",             name: "100 Flexões Seguidas",       description: "Completou 100 flexões de uma vez.",                   icon: "💪", category: AchievementCategory.SPORTS, rarity: AchievementRarity.RARE,      sortOrder: 12 },
  ]);
  console.log(`✅ Pack "Esportes & Adrenalina" — 12 conquistas`);

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  const totalAchievements = await prisma.achievement.count();
  const totalPacks = await prisma.achievementPack.count();
  console.log(`\n🏆 Seed concluído!`);
  console.log(`   ${totalPacks} packs · ${totalAchievements} conquistas no total`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
