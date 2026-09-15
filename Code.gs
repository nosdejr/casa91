/**
 * Casa 91 - Jejum 21 Dias
 * Google Apps Script Backend
 * 
 * Como usar:
 * 1. Cole este código no Apps Script da sua planilha
 * 2. Implante como Aplicativo da Web (Qualquer pessoa)
 * 3. Copie a URL e cole em js/app.js → CONFIG.API_URL
 */

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

// ========== Leitura ==========
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
    obj.row = i + 2; // número da linha real na planilha
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
    totalMin += Number(r[3]) || 0; // coluna Minutos (índice 3)
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
    .map(([nome, min]) => ({
      nome,
      minutos: min,
      horas: Math.round((min / 60) * 10) / 10
    }))
    .sort((a, b) => b.minutos - a.minutos);
  return { ranking };
}

// ========== Escrita ==========
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
