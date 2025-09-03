# 🌱 Database Seeding

Este script popula o banco de dados com usuários e posts realistas para testar a aplicação.

## Como usar

1. **Certifique-se de que o banco está rodando e as tabelas foram criadas**
2. **No diretório da API, execute:**

```bash
npm run seed
```

## O que o script faz

### 👥 Usuários criados (12 usuários):
- `techgirl_2023` (Ana Silva) - Desenvolvedora Frontend
- `coder_life` (Bruno Costa) - Full-stack developer  
- `dev_dreams` (Carla Santos) - Backend engineer
- `pixel_master` (Diego Lima) - UI/UX Designer + Frontend Dev
- `js_wizard` (Elena Oliveira) - JavaScript/React Native
- `react_ninja` (Felipe Rocha) - Senior React Developer
- `css_queen` (Gabriela Alves) - CSS Master
- `python_guru` (Hugo Ferreira) - Data Scientist & Python Dev
- `mobile_dev` (Isabela Martins) - Flutter & React Native
- `fullstack_pro` (João Pereira) - Full Stack Engineer
- `code_artist` (Lara Mendes) - Creative Coder
- `web3_builder` (Marcos Ribeiro) - Blockchain developer

### 📝 Posts:
- Cada usuário recebe entre 2-5 posts aleatórios
- Conteúdos realistas sobre programação e tech
- Posts com timestamps das últimas 48h

### ❤️ Interações:
- Likes aleatórios (0-14 por post)
- Hates aleatórios (0-4 por post)

## Credenciais dos usuários

**Todos os usuários têm a senha:** `senha123`

**Emails seguem o padrão:** `nome@example.com`

## Exemplo de uso

```bash
cd /Users/gabriel/workspace/rede-social/api
npm run seed
```

Saída esperada:
```
🌱 Iniciando seed do banco de dados...
✅ Conectado ao banco de dados!
🌱 Criando usuários...
✅ Usuário criado: techgirl_2023
✅ Usuário criado: coder_life
...
📝 Criando posts...
✅ Post criado para techgirl_2023
...
❤️ Adicionando likes aleatórios...
✅ Likes e hates adicionados!
🎉 Seed concluído com sucesso!
```

## ⚠️ Importante

- Execute apenas uma vez ou limpe os dados antes de executar novamente
- O script irá ignorar usuários que já existem (evita duplicatas)
- Certifique-se de que as variáveis de ambiente do banco estão configuradas

## 🔧 Troubleshooting

Se houver erros:
1. Verifique se o PostgreSQL está rodando
2. Confirme se as tabelas foram criadas com as migrations
3. Verifique as credenciais do banco no `.env`
4. Execute `npm install` se houver problemas de dependências