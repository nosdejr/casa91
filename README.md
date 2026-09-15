# Casa 91 — Jejum e Oração 21 Dias

Webapp mobile-first para acompanhar o jejum de 21 dias da Casa 91.  
Hospedado no **GitHub Pages** + **Google Sheets** como banco de dados.

## Funcionalidades

- **Dashboard**: cards com alvos (Horas de Oração, Visitas, Batismo, Conversão) + progresso + ranking + total da célula
- **Formulário semanal**: o irmão escolhe o nome, a semana e preenche os minutos de cada dia de uma vez
- **Admin** (protegido por senha):
  - Adicionar / excluir nomes
  - Excluir registros incorretos
  - Atualizar Visitas e Batismos atuais
  - Ver ranking completo e todos os lançamentos

## Semanas configuradas

| Semana | Período              |
|--------|----------------------|
| 1ª     | 14/09 a 20/09/2026  |
| 2ª     | 21/09 a 27/09/2026  |
| 3ª     | 28/09 a 04/10/2026  |

---

## 1. Configurar a Planilha Google

1. Crie uma nova planilha no Google Drive.
2. Crie **3 abas** com exatamente estes nomes:

### Aba `Membros`
| Nome          |
|---------------|
| João Silva    |
| Maria Souza   |
| ...           |

### Aba `Registros`
| Nome | Data | DiaSemana | Minutos | Timestamp | Semana |
|------|------|-----------|---------|-----------|--------|
| (deixe só o cabeçalho) | | | | | |

### Aba `Alvos`
| Chave         | Valor          |
|---------------|----------------|
| HorasMeta     | 158            |
| VisitasMeta   | 3              |
| VisitasAtual  | 0              |
| BatismosMeta  | 3              |
| BatismosAtual | 0              |
| Conversao     | 5 por Membro   |

3. Preencha a aba **Membros** com os nomes dos irmãos.

---

## 2. Google Apps Script (Backend)

1. Na planilha → **Extensões → Apps Script**.
2. Apague o código padrão e cole o conteúdo do arquivo `Code.gs` (veja abaixo).
3. Clique em **Salvar**.
4. Clique em **Implantar → Novo deployment**.
5. Tipo: **Aplicativo da Web**.
6. Descrição: `Casa 91 API`.
7. Executar como: **Eu**.
8. Quem tem acesso: **Qualquer pessoa**.
9. Clique em **Implantar** e autorize as permissões.
10. **Copie a URL** gerada (termina com `/exec`).

### Código do Apps Script (`Code.gs`)

```javascript
function doGet(e) {
  const action = e.parameter.action;
  let result = {};

  try {
    switch (action) {
      case 'getMembros':
        result = getMembros();
        break;
      case 'getRegistros':
        result = getRegistros();
        break;
      case 'getAlvos':
        result = getAlvos();
        break;
      case 'getRanking':
        result = getRanking();
        break;
      case 'getTotalHoras':
        result = { totalHoras: getTotalHoras() };
        break;
      default:
        result = { error: 'Ação inválida' };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result = {};
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case 'submitOração':
        result = submitOração(data);
        break;
      case 'addMembro':
        result = addMembro(data.nome);
        break;
      case 'deleteMembro':
        result = deleteMembro(data.nome);
        break;
      case 'updateAlvos':
        result = updateAlvos(data);
        break;
      case 'deleteRegistro':
        result = deleteRegistro(data.row);
        break;
      case 'updateRegistro':
        result = updateRegistro(data);
        break;
      default:
        result = { error: 'Ação inválida' };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getMembros() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Membros');
  const values = sheet.getDataRange().getValues();
  const nomes = values.slice(1).map(r => r[0]).filter(n => n);
  return { membros: nomes };
}

function getRegistros() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Registros');
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const data = values.slice(1).map((row, i) => {
    const obj = {};
    headers.forEach((h, idx) => obj[h] = row[idx]);
    obj.row = i + 2;
    return obj;
  });
  return { registros: data };
}

function getAlvos() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Alvos');
  const values = sheet.getDataRange().getValues();
  const alvos = {};
  values.slice(1).forEach(r => {
    if (r[0]) alvos[r[0]] = r[1];
  });
  alvos.HorasAtual = getTotalHoras();
  return { alvos };
}

function getTotalHoras() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Registros');
  const values = sheet.getDataRange().getValues();
  let totalMin = 0;
  values.slice(1).forEach(r => {
    totalMin += Number(r[3]) || 0;
  });
  return Math.round((totalMin / 60) * 10) / 10;
}

function getRanking() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Registros');
  const values = sheet.getDataRange().getValues();
  const map = {};
  values.slice(1).forEach(r => {
    const nome = r[0];
    const min = Number(r[3]) || 0;
    if (nome) map[nome] = (map[nome] || 0) + min;
  });
  const ranking = Object.entries(map)
    .map(([nome, min]) => ({ nome, minutos: min, horas: Math.round((min / 60) * 10) / 10 }))
    .sort((a, b) => b.minutos - a.minutos);
  return { ranking };
}

function submitOração(data) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Registros');
  const timestamp = new Date();
  data.dias.forEach(d => {
    if (d.minutos > 0) {
      sheet.appendRow([
        data.nome,
        d.data,
        d.diaSemana,
        d.minutos,
        timestamp,
        data.semana
      ]);
    }
  });
  return { success: true, message: 'Registro enviado com sucesso!' };
}

function addMembro(nome) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Membros');
  sheet.appendRow([nome]);
  return { success: true };
}

function deleteMembro(nome) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Membros');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === nome) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Membro não encontrado' };
}

function updateAlvos(data) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Alvos');
  const values = sheet.getDataRange().getValues();
  values.forEach((r, i) => {
    if (data[r[0]] !== undefined) {
      sheet.getRange(i + 1, 2).setValue(data[r[0]]);
    }
  });
  return { success: true };
}

function deleteRegistro(row) {
  SpreadsheetApp.getActive().getSheetByName('Registros').deleteRow(row);
  return { success: true };
}

function updateRegistro(data) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Registros');
  sheet.getRange(data.row, 1, 1, 6).setValues([[
    data.Nome, data.Data, data.DiaSemana, data.Minutos, data.Timestamp, data.Semana
  ]]);
  return { success: true };
}
```

---

## 3. Configurar o Frontend

1. Abra o arquivo `js/app.js`.
2. Substitua a linha:

```js
API_URL: 'https://script.google.com/macros/s/SEU_ID_AQUI/exec',
```

pela URL que você copiou no passo 2.

3. (Opcional) Altere a senha do admin:

```js
ADMIN_PASSWORD: 'casa91admin',
```

---

## 4. Publicar no GitHub Pages

1. Crie um repositório no GitHub (pode ser público).
2. Faça upload de todos os arquivos desta pasta:
   - `index.html`
   - `formulario.html`
   - `admin.html`
   - `css/style.css`
   - `js/app.js`
   - `README.md`
3. Vá em **Settings → Pages**.
4. Source: **Deploy from a branch** → branch `main` → pasta `/ (root)`.
5. Aguarde alguns minutos e acesse a URL gerada (ex: `https://seu-usuario.github.io/nome-do-repo/`).

---

## 5. Fluxo de uso

### Irmãos (toda sexta-feira)
1. Abrem o site → **Lançar Oração**
2. Selecionam o nome
3. Escolhem a semana
4. Preenchem os minutos de cada dia
5. Clicam em **Enviar**

### Administrador
1. Acessa **Admin** e digita a senha
2. Pode:
   - Atualizar quantas Visitas e Batismos já aconteceram
   - Adicionar/remover nomes
   - Excluir lançamentos errados
   - Ver o ranking completo

---

## Observações importantes

- A senha do admin é apenas client-side (básica). Para uso interno da célula é suficiente.
- Toda vez que você alterar o Apps Script, precisa fazer um **novo deployment** (ou “Gerenciar deployments → Editar → Nova versão”).
- Os minutos são convertidos automaticamente em horas (com 1 casa decimal) no dashboard.
- Só são salvos dias com minutos > 0.

Que Deus abençoe o jejum da Casa 91! 🙏
