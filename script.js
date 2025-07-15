import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAmKEvmYmAglgxazFIcpSWw6QHzASyJin4",
  authDomain: "ps5-agenda.firebaseapp.com",
  databaseURL: "https://ps5-agenda-default-rtdb.firebaseio.com",
  projectId: "ps5-agenda",
  storageBucket: "ps5-agenda.appspot.com",
  messagingSenderId: "6232773262",
  appId: "1:6232773262:web:79194fb61c8b43b1556fdf"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let horariosManha = [], horariosTarde = [];
const horariosDiv = document.getElementById("horarios");
let horarioSelecionado = null;

async function carregarConfiguracoes() {
  const snap = await get(ref(db, "config"));
  if (snap.exists()) {
    const config = snap.val();
    horariosManha = config.horariosManha || [];
    horariosTarde = config.horariosTarde || [];
    carregarHorarios();
  }
}

function renderHorarios(dados, turno) {
  const lista = turno === "manhã" ? horariosManha : horariosTarde;
  horariosDiv.innerHTML = "";
  lista.forEach(horario => {
    const div = document.createElement("div");
    div.className = "horario";
    div.textContent = horario;

    if (dados && dados[horario]) {
      div.classList.add("ocupado");
    } else {
      div.onclick = () => {
        document.querySelectorAll(".horario").forEach(el => el.classList.remove("selecionado"));
        div.classList.add("selecionado");
        horarioSelecionado = horario;
      };
    }

    horariosDiv.appendChild(div);
  });
}

function getTurnoSelecionado() {
  return document.querySelector('input[name="turno"]:checked').value;
}

function carregarHorarios() {
  const turno = getTurnoSelecionado();
  onValue(ref(db, "agendamentos"), (snap) => {
    renderHorarios(snap.val(), turno);
  });
}

document.querySelectorAll('input[name="turno"]').forEach(r => {
  r.addEventListener("change", carregarHorarios);
});

carregarConfiguracoes();

window.agendar = function () {
  const nome = document.getElementById("nome").value.trim();
  const local = document.getElementById("local").value;
  const turno = getTurnoSelecionado();

  if (!nome || !horarioSelecionado) {
    alert("Preencha todos os dados e escolha um horário.");
    return;
  }

  set(ref(db, "agendamentos/" + horarioSelecionado), {
    nome,
    local,
    turno
  }).then(() => {
    alert("✅ Agendado com sucesso para " + horarioSelecionado);
    Notification.requestPermission().then(() => {
      new Notification("Seu horário foi reservado!");
    });
  });
};
