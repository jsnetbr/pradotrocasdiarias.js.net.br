# Trocas JS Net BR

Aplicativo para acompanhar o relatório diário de trocas por departamento.

## Como rodar

1. Instale as dependências:
   `npm install`
2. Abra o app local:
   `npm run dev`
3. Gere a versão final:
   `npm run build`

## Firebase

Este projeto usa Firebase Authentication com login Google e Firestore para salvar os dados.

Antes de usar com dados reais:

1. Ative o login Google no Firebase Authentication.
2. Adicione o domínio do site nos domínios autorizados do Firebase.
3. Publique o arquivo `firestore.rules` no Firestore.

As regras atuais exigem login para ver e alterar os relatórios.
