# Configuração de Email para Relatórios

O sistema de envio de relatórios por email requer a configuração de variáveis de ambiente no arquivo `.env`.

## Variáveis Necessárias

- `EMAIL_HOST`: Servidor SMTP (ex: smtp.gmail.com)
- `EMAIL_USER`: Endereço de email
- `EMAIL_PASS`: Senha ou App Password

## Configuração com Gmail

### Desenvolvimento Local

1. Abra o arquivo `.env` no diretório `fisimaster-api/`
2. Configure as variáveis:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_app_password
```

### Obter App Password do Gmail

1. Acesse sua conta Google: https://myaccount.google.com/
2. Ative a autenticação de dois fatores (se não estiver ativada)
3. Vá para https://myaccount.google.com/apppasswords
4. Selecione "Mail" e "Windows Computer" (ou seu dispositivo)
5. Copie a senha gerada (16 caracteres)
6. Cole no campo `EMAIL_PASS` do `.env`

### Configuração com Outros Provedores

Configure o `EMAIL_HOST` apropriado para seu provedor:

- **SendGrid**: `smtp.sendgrid.net` (usar `apikey` como usuário)
- **Mailgun**: `smtp.mailgun.org`
- **Outlook**: `smtp.office365.com`
- **SES (AWS)**: `email-smtp.[region].amazonaws.com`
- **Resend**: `smtp.resend.com`

## Deploy no Render

### Passo 1: Acessar as Variáveis de Ambiente

1. Acesse seu projeto no [Render Dashboard](https://dashboard.render.com)
2. Clique no seu serviço FisiMaster API
3. Vá para aba **Environment**

### Passo 2: Adicionar as Variáveis

Adicione as três variáveis obrigatórias:

| Chave | Valor | Exemplo |
|-------|-------|---------|
| `EMAIL_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `EMAIL_USER` | Seu email | `seu_email@gmail.com` |
| `EMAIL_PASS` | App Password | (senha gerada) |

### Passo 3: Redeployer

Após adicionar as variáveis:

1. Clique no botão "Save" 
2. Render fará um novo deploy automaticamente
3. Aguarde o deploy ficar como "Live"

## Testando o Envio

Após configurar corretamente:

1. Faça login na aplicação
2. Navegue até a página de Relatórios
3. Clique em um dos botões "Enviar" (Completo, Particular ou Planos)
4. Insira um email válido no campo "Destinatário"
5. Verifique se o email chegou

## Erros Comuns

### Error: Connection timeout
- **Causa**: Credenciais incorretas ou servidor SMTP inacessível
- **Solução**: Verifique se `EMAIL_HOST`, `EMAIL_USER` e `EMAIL_PASS` estão corretos no Render

### Error: Invalid credentials
- **Causa**: App Password incorreta ou expirada
- **Solução**: Gere uma nova App Password no Google e atualize no Render

### Email não chega
- **Causa**: Filtro de spam ou erro de configuração
- **Solução**: Verifique pasta de spam/lixo e aumente o timeout do email

## Incrementar Timeout (se necessário)

Se receber "Connection timeout" frequentemente, você pode incrementar o timeout:

1. Edite o arquivo `utils/emailUtils.js`
2. Altere `socketTimeout: 60000` para um valor maior (ex: 120000 para 2 minutos)

```javascript
socketTimeout: 120000,  // 2 minutos
```

## Segurança

- **Nunca** faça commit do arquivo `.env` (está no `.gitignore`)
- **Nunca** compartilhe suas credenciais de email
- Use App Passwords do Google, não sua senha principal
- Para produção, considere usar um serviço dedicado como SendGrid ou Mailgun
