# Deploy no Render - Guia Completo

## Problemas Comuns no Render

### 1. Connection Timeout no Email
**Erro**: `Error: Connection timeout` com código `ETIMEDOUT`

**Causa**: Variáveis de email não configuradas no Render

**Solução**:
1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique no seu serviço FisiMaster API
3. Vá para **Environment** (ou Environment Variables)
4. Adicione as três variáveis obrigatórias:
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_USER=seu_email@gmail.com`
   - `EMAIL_PASS=sua_app_password_gerada`
5. Clique **Save** (Render fará deploy automático)
6. Aguarde até que o status mude para "Live"

### 2. Chrome/Puppeteer não encontrado
**Erro**: `Could not find Chrome (ver. 127.0.6533.88)`

**Solução**: Removemos o Puppeteer e agora usamos jsPDF que não requer navegador.

Se você receber este erro:
1. Acesse seu repositório GitHub
2. Faça pull das mudanças mais recentes
3. No Render, clique em **Manual Deploy** ou aguarde o webhook do GitHub

## Configuração Inicial do Render

Se estiver configurando o Render pela primeira vez:

### Criar Variáveis de Ambiente

No painel do Render:

1. **Environment Variables**:
   ```
   MONGO_URI=mongodb+srv://[user]:[password]@[cluster].mongodb.net/fisimaster
   JWT_SECRET=sua_secret_key_muito_segura
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=sua_app_password
   NODE_ENV=production
   PORT=5000
   ```

2. Clique **Save**
3. Render fará um novo deploy automaticamente

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas (Email, JWT, MongoDB)
- [ ] GitHub conectado ao Render
- [ ] Build logs mostram "Build successful"
- [ ] Status do serviço é "Live"
- [ ] Servidor MongoDB está acessível (verifique IP allowlist)
- [ ] Testes de email funcionam

## Verificar Logs

Para ver o que está acontecendo:

1. Acesse seu serviço no Render
2. Clique na aba **Logs**
3. Procure por "Connection timeout" ou outros erros
4. Se receber erro de email, verifique as variáveis de ambiente

## Rollback/Redeploy

Se algo deu errado:

1. Acesse seu serviço
2. Clique em **Manual Deploy**
3. Selecione um commit anterior se necessário
4. Clique **Deploy**

## Aumentar Timeout (opcional)

Se o email estiver muito lento:

1. Edite `utils/emailUtils.js` localmente
2. Altere `socketTimeout: 60000` para `socketTimeout: 120000`
3. Faça commit e push
4. Render fará deploy automático
