import { pool } from '../config/database';
import { UserModel } from '../models/User';
import { PostModel } from '../models/Post';

interface MockUser {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio?: string;
}

const mockUsers: MockUser[] = [
  {
    username: "techgirl_2023",
    email: "ana@example.com",
    password: "senha123",
    firstName: "Ana",
    lastName: "Silva",
    bio: "Desenvolvedora Frontend apaixonada por React e TypeScript 💻"
  },
  {
    username: "coder_life",
    email: "bruno@example.com",
    password: "senha123",
    firstName: "Bruno",
    lastName: "Costa",
    bio: "Full-stack developer | Coffee addicted ☕ | Always learning something new 🚀"
  },
  {
    username: "dev_dreams",
    email: "carla@example.com",
    password: "senha123",
    firstName: "Carla",
    lastName: "Santos",
    bio: "Backend engineer | Python & Node.js | Building the future one API at a time 🔧"
  },
  {
    username: "pixel_master",
    email: "diego@example.com",
    password: "senha123",
    firstName: "Diego",
    lastName: "Lima",
    bio: "UI/UX Designer + Frontend Dev | Making the web beautiful 🎨"
  },
  {
    username: "js_wizard",
    email: "elena@example.com",
    password: "senha123",
    firstName: "Elena",
    lastName: "Oliveira",
    bio: "JavaScript enthusiast | React Native developer | 📱 Mobile first!"
  },
  {
    username: "react_ninja",
    email: "felipe@example.com",
    password: "senha123",
    firstName: "Felipe",
    lastName: "Rocha",
    bio: "Senior React Developer | Open source contributor 🌟"
  },
  {
    username: "css_queen",
    email: "gabriela@example.com",
    password: "senha123",
    firstName: "Gabriela",
    lastName: "Alves",
    bio: "CSS Master | Sass & Styled Components lover 💅 | Making layouts shine ✨"
  },
  {
    username: "python_guru",
    email: "hugo@example.com",
    password: "senha123",
    firstName: "Hugo",
    lastName: "Ferreira",
    bio: "Data Scientist & Python Developer 🐍 | AI/ML enthusiast"
  },
  {
    username: "mobile_dev",
    email: "isabela@example.com",
    password: "senha123",
    firstName: "Isabela",
    lastName: "Martins",
    bio: "Flutter & React Native developer 📱 | Cross-platform apps specialist"
  },
  {
    username: "fullstack_pro",
    email: "joao@example.com",
    password: "senha123",
    firstName: "João",
    lastName: "Pereira",
    bio: "Full Stack Engineer | MERN Stack | DevOps enthusiast 🛠️"
  },
  {
    username: "code_artist",
    email: "lara@example.com",
    password: "senha123",
    firstName: "Lara",
    lastName: "Mendes",
    bio: "Creative Coder | Making art with algorithms 🎭 | Generative design"
  },
  {
    username: "web3_builder",
    email: "marcos@example.com",
    password: "senha123",
    firstName: "Marcos",
    lastName: "Ribeiro",
    bio: "Blockchain developer | Solidity & Web3 🔗 | Building the decentralized future"
  }
];

const postContents = [
  "Acabei de finalizar um projeto incrível usando Next.js! A performance ficou impressionante 🚀",
  "Alguém mais está viciado em café igual eu? Já estou na quinta xícara hoje... ☕😅",
  "Descobri essa biblioteca nova hoje e estou completamente apaixonado(a)! Vai revolucionar meu workflow 💻",
  "Sexta-feira à noite debugando... Quem disse que dev não tem vida social? 🐛💻",
  "Programar ouvindo música é vida! Hoje estou no Lofi Hip Hop para manter o foco 🎵👨‍💻",
  "FINALMENTE! Resolvi aquele bug que estava me atormentando há 3 dias! 🎉 A sensação é indescritível",
  "Pair programming é uma das melhores práticas do desenvolvimento. Quem concorda? 👨‍💻👩‍💻",
  "Estou pensando em aprender Rust. Alguém tem experiência? Vale a pena o investimento? 🤔",
  "Deploy em produção feito com sucesso! 🥳 Zero bugs até agora... *bate na madeira* 🪵",
  "Aquela sensação quando o código funciona na primeira tentativa... Raro, mas mágico! ✨😅",
  "Fim de semana = side project time! Trabalhando numa ideia que pode virar startup 💡🚀",
  "Procurando alguém para pair programming hoje! Projeto open source super interessante 🤝",
  "Refatoração completa hoje! Código limpo é código que funciona e que outros conseguem entender ✨",
  "Descobri que programar é 20% código, 30% Google e 50% StackOverflow 😂",
  "Hipnotizado vendo meu código rodar perfeitamente... É quase meditativo 👀💻",
  "Primeira vez usando Docker em produção. A facilidade de deploy é surreal! 🐳",
  "Code review sempre me deixa nervoso... Mas é essencial para crescer como dev 📊",
  "Testando uma nova IDE hoje. Produtividade já aumentou 200%! 🚀",
  "Quem mais ama resolver algoritmos nas horas vagas? LeetCode é meu hobby secreto 🧩",
  "Contribuí para um projeto open source hoje! Sensação incrível de fazer parte da comunidade 🌟"
];

async function createUsers() {
  console.log('🌱 Criando usuários...');
  const createdUsers = [];
  
  for (const userData of mockUsers) {
    try {
      const user = await UserModel.create({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      
      // Atualiza a bio separadamente (se o modelo permitir)
      if (userData.bio) {
        await pool.query(
          'UPDATE users SET bio = $1 WHERE id = $2',
          [userData.bio, user.id]
        );
      }
      
      createdUsers.push({ ...user, bio: userData.bio });
      console.log(`✅ Usuário criado: ${userData.username}`);
    } catch (error) {
      console.log(`⚠️ Usuário ${userData.username} já existe ou erro: ${error}`);
    }
  }
  
  return createdUsers;
}

async function createPosts(users: any[]) {
  console.log('📝 Criando posts...');
  
  for (const user of users) {
    // Cada usuário terá entre 2 a 5 posts
    const numPosts = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < numPosts; i++) {
      try {
        const randomContent = postContents[Math.floor(Math.random() * postContents.length)];
        
        await PostModel.create(user.id, {
          content: randomContent,
          imageUrl: undefined
        });
        
        console.log(`✅ Post criado para ${user.username}`);
      } catch (error) {
        console.log(`⚠️ Erro ao criar post para ${user.username}: ${error}`);
      }
    }
  }
}

async function addRandomLikes(users: any[]) {
  console.log('❤️ Adicionando likes aleatórios...');
  
  try {
    // Busca todos os posts
    const postsResult = await pool.query('SELECT id FROM posts');
    const posts = postsResult.rows;
    
    // Para cada post, adiciona likes aleatórios
    for (const post of posts) {
      const numLikes = Math.floor(Math.random() * 15); // 0 a 14 likes
      const numHates = Math.floor(Math.random() * 5); // 0 a 4 hates
      
      // Atualiza contadores diretamente na tabela
      await pool.query(
        'UPDATE posts SET likes_count = $1, hates_count = $2 WHERE id = $3',
        [numLikes, numHates, post.id]
      );
    }
    
    console.log('✅ Likes e hates adicionados!');
  } catch (error) {
    console.log(`⚠️ Erro ao adicionar likes: ${error}`);
  }
}

async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...\n');
  
  try {
    // Verifica conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado ao banco de dados!\n');
    
    // Cria usuários
    const users = await createUsers();
    console.log(`\n✅ ${users.length} usuários processados!\n`);
    
    // Cria posts
    if (users.length > 0) {
      await createPosts(users);
      console.log('\n✅ Posts criados!\n');
      
      // Adiciona likes aleatórios
      await addRandomLikes(users);
      console.log('\n✅ Interações adicionadas!\n');
    }
    
    console.log('🎉 Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`- ${mockUsers.length} usuários configurados`);
    console.log(`- Posts aleatórios criados para cada usuário`);
    console.log(`- Likes e hates distribuídos aleatoriamente`);
    console.log('\n🚀 Banco de dados populado e pronto para uso!');
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Executa o seed
seedDatabase();