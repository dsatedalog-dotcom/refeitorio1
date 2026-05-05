const URL_API = "https://script.google.com/macros/s/AKfycbxg598dkBcVLDKhzsrfCDQ1pHRkUEgPvy3CDUnx7miWnSFJNAUbJFCwlSEoQF9M8RL9mg/exec";

// ELEMENTOS
const telaInicial = document.getElementById("telaInicial");
const telaFormulario = document.getElementById("telaFormulario");
const btnIniciar = document.getElementById("btnIniciar");

const form = document.getElementById("formRefeicao");
const mensagem = document.getElementById("mensagem");

const btnValidar = document.getElementById("btnValidar");
const nomeUsuario = document.getElementById("nomeUsuario");

// ==========================
// 📦 CACHE DE CADASTROS
// ==========================
let cadastros = {};

// ==========================
// 🚀 CARREGAR CADASTROS
// ==========================
async function carregarCadastros() {
    try {
        const res = await fetch(URL_API);
        const lista = await res.json();

        cadastros = {};

        lista.forEach(item => {
            cadastros[item.matricula] = item.nome;
        });

        // salva local
        localStorage.setItem("cadastros", JSON.stringify(cadastros));

        console.log("Cadastros carregados");

    } catch (erro) {
        console.error("Erro ao carregar:", erro);

        // fallback local
        cadastros = JSON.parse(localStorage.getItem("cadastros")) || {};
    }
}

// ==========================
// 🔍 BUSCA LOCAL
// ==========================
function buscarMatricula(matricula) {
    return cadastros[matricula];
}

// ==========================
// 📦 FILA OFFLINE
// ==========================
function getFila() {
    return JSON.parse(localStorage.getItem("fila")) || [];
}

function salvarFila(fila) {
    localStorage.setItem("fila", JSON.stringify(fila));
}

function adicionarFila(dados) {
    const fila = getFila();
    fila.push(dados);
    salvarFila(fila);
}

// ==========================
// 🚀 ENVIO (NO-CORS)
// ==========================
function enviarFila() {
    if (!navigator.onLine) return;

    let fila = getFila();
    const novaFila = [];

    fila.forEach(item => {
        try {
            fetch(URL_API, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify(item)
            });
        } catch {
            novaFila.push(item);
        }
    });

    salvarFila(novaFila);
}

// ==========================
// 🔁 TELAS
// ==========================
btnIniciar.onclick = () => {
    telaInicial.classList.add("hidden");
    telaFormulario.classList.remove("hidden");
};

// ==========================
// 🔍 VALIDAR (LOCAL)
// ==========================
btnValidar.onclick = () => {
    const matricula = document.getElementById("matricula").value.trim();

    if (!matricula) {
        nomeUsuario.innerText = "Informe a matrícula";
        nomeUsuario.style.color = "red";
        return;
    }

    const nome = buscarMatricula(matricula);

    if (nome) {
        nomeUsuario.innerText = nome;
        nomeUsuario.style.color = "green";
    } else {
        nomeUsuario.innerText = "Não encontrado";
        nomeUsuario.style.color = "red";
    }
};

// ==========================
// 📤 SUBMIT
// ==========================
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const matricula = document.getElementById("matricula").value.trim();
    const refeicaoSelecionada = document.querySelector('input[name="refeicao"]:checked');

    if (!matricula || !refeicaoSelecionada) {
        mensagem.innerText = "Preencha todos os campos";
        mensagem.style.color = "red";
        return;
    }

    const dados = {
        matricula,
        refeicao: refeicaoSelecionada.value,
        data: new Date().toISOString()
    };

    adicionarFila(dados);
    enviarFila();

    mensagem.innerText = "Registro salvo!";
    mensagem.style.color = "green";

    form.reset();
    nomeUsuario.innerText = "";
    
    

    setTimeout(() => {
        telaFormulario.classList.add("hidden");
        telaInicial.classList.remove("hidden");
        mensagem.innerText = "";
    }, 800);
});

// ==========================
// 🌐 INIT
// ==========================
window.addEventListener("load", () => {
    carregarCadastros();
    enviarFila();
});

window.addEventListener("online", enviarFila);