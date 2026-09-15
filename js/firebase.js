// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7uF7LInToJE5T8kn8LlYlI38reXmwi-Y",
  authDomain: "casa91raizes.firebaseapp.com",
  projectId: "casa91raizes",
  storageBucket: "casa91raizes.firebasestorage.app",
  messagingSenderId: "826873600857",
  appId: "1:826873600857:web:233d13a9d58ecb14e88a48",
  measurementId: "G-FXTP19RZGY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========== LEITURA ==========
export async function getMembros() {
  const snap = await getDocs(collection(db, "membros"));
  const membros = [];
  snap.forEach(d => membros.push(d.data().nome));
  membros.sort((a, b) => a.localeCompare(b, "pt-BR"));
  return { membros };
}

export async function getRegistros() {
  const q = query(collection(db, "registros"), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  const registros = [];
  snap.forEach(d => {
    const data = d.data();
    registros.push({
      id: d.id,
      Nome: data.nome,
      Data: data.data,
      DiaSemana: data.diaSemana,
      Minutos: data.minutos,
      Semana: data.semana
    });
  });
  return { registros };
}

export async function getAlvos() {
  const ref = doc(db, "alvos", "config");
  const snap = await getDoc(ref);

  let alvos = {
    HorasMeta: 158,
    VisitasMeta: 3,
    VisitasAtual: 0,
    BatismosMeta: 3,
    BatismosAtual: 0,
    Conversao: "5 por Membro"
  };

  if (snap.exists()) {
    alvos = { ...alvos, ...snap.data() };
  }

  // Calcula total de horas
  const regSnap = await getDocs(collection(db, "registros"));
  let totalMin = 0;
  regSnap.forEach(d => totalMin += Number(d.data().minutos) || 0);
  alvos.HorasAtual = Math.round((totalMin / 60) * 10) / 10;

  return { alvos };
}

export async function getRanking() {
  const snap = await getDocs(collection(db, "registros"));
  const map = {};
  snap.forEach(d => {
    const { nome, minutos } = d.data();
    if (nome) map[nome] = (map[nome] || 0) + (Number(minutos) || 0);
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

// ========== ESCRITA ==========
export async function submitOração(data) {
  const promises = data.dias
    .filter(d => d.minutos > 0)
    .map(d =>
      addDoc(collection(db, "registros"), {
        nome: data.nome,
        data: d.data,
        diaSemana: d.diaSemana,
        minutos: Number(d.minutos),
        semana: data.semana,
        timestamp: serverTimestamp()
      })
    );
  await Promise.all(promises);
  return { success: true, message: "Registro enviado com sucesso!" };
}

export async function addMembro(nome) {
  await addDoc(collection(db, "membros"), {
    nome: nome.trim(),
    createdAt: serverTimestamp()
  });
  return { success: true };
}

export async function deleteMembro(nome) {
  const snap = await getDocs(collection(db, "membros"));
  const promises = [];
  snap.forEach(d => {
    if (d.data().nome === nome) promises.push(deleteDoc(d.ref));
  });
  await Promise.all(promises);
  return { success: true };
}

export async function updateAlvos(data) {
  const ref = doc(db, "alvos", "config");
  await setDoc(ref, data, { merge: true });
  return { success: true };
}

export async function deleteRegistro(id) {
  await deleteDoc(doc(db, "registros", id));
  return { success: true };
}
