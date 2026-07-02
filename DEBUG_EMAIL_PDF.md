# Checklist de Troubleshooting - Email e PDF

## Problema: PDF em Branco ✓ CORRIGIDO
**Causa**: Tentativa de parsear HTML para PDF não estava funcionando  
**Solução**: Substituído por jsPDF com geração nativa de dados

### Verificar:
- [ ] PDF agora deve ser gerado corretamente
- [ ] Verificar se o arquivo baixado tem conteúdo

---

## Problema: Email Não Enviado

### 1. Verificar Configuração de Variáveis no Render

**Acesso**: 
1. Acesse https://dashboard.render.com
2. Clique no serviço FisiMaster API
3. Vá para **Environment**

**Verificar se estão configuradas**:
- [ ] `EMAIL_HOST` está preenchido (ex: `smtp.gmail.com`)
- [ ] `EMAIL_USER` está preenchido (seu email completo)
- [ ] `EMAIL_PASS` está preenchido (app password, não sua senha)

**Se não estão**:
1. Adicione as três variáveis
2. Clique **Save**
3. Aguarde o deployment automático até o status ficar **Live**

### 2. Verificar Credenciais Gmail

Se usando Gmail:

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "Mail" e "Windows Computer"
3. Copie a senha de 16 caracteres
4. **Atualize** no Render o campo `EMAIL_PASS`

### 3. Verificar Logs no Render

1. No painel do Render, clique em **Logs**
2. Procure por:
   - `Error: Connection timeout` - credenciais erradas
   - `Variáveis de ambiente de email não configuradas` - faltam variáveis
   - `ETIMEDOUT` - servidor SMTP não respondendo

### 4. Testar Email Localmente

Para desenvolver/testar localmente:

1. Configure o arquivo `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_app_password
MONGO_URI=mongodb://localhost:27017/fisimaster
JWT_SECRET=dev_secret
```

2. Teste com:
```bash
npm install
npm start
```

3. Faça uma requisição POST para:
```
POST /api/relatorios/email
Authorization: Bearer [SEU_TOKEN]
Body: { "to": "teste@gmail.com" }
```

### 5. Verificar Firewall/Bloqueios

Se receber erro de timeout:

1. Verifique se a porta 587 (SMTP) não está bloqueada
2. Tente com `EMAIL_HOST=smtp.gmail.com` ou `EMAIL_HOST=smtp.office365.com`
3. Verifique se a App Password foi gerada corretamente

### 6. Aumentar Timeout (se necessário)

Se o email é muito lento:

1. Edite `utils/emailUtils.js`
2. Altere:
```javascript
socketTimeout: 60000,  // 60 segundos
```
Para:
```javascript
socketTimeout: 120000,  // 120 segundos
```
3. Faça commit e push

---

## Resumo do Fluxo de Email

```
Usuario clica "Enviar Email"
        ↓
Frontend: POST /api/relatorios/email
        ↓
Backend: aggregateData() busca dados do banco
        ↓
Backend: buildCompleteReportHTML() cria HTML
        ↓
Backend: sendEmail() conecta ao SMTP
        ↓
Se EMAIL_HOST/USER/PASS não configurados → ERRO
        ↓
Se credenciais erradas → Timeout
        ↓
Se OK → Email enviado
        ↓
Frontend: Mostra "E-mail enviado com sucesso"
```

---

## Checklist Final

- [ ] Variáveis de email configuradas no Render
- [ ] App Password do Gmail gerado e testado
- [ ] Deployment concluído (status Live)
- [ ] PDF sendo gerado corretamente
- [ ] Email chegando na caixa de entrada ou spam
- [ ] Testar com um email válido

---

## Contato para Debug

Se ainda tiver problemas, verificar:

1. **Logs do Render** - Acessar Environment → Logs
2. **Email pode estar em Spam** - Verificar pasta de lixo
3. **Credenciais expiradas** - Gerar nova App Password
4. **Timeout** - Aumentar socketTimeout em emailUtils.js
