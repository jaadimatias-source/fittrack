
"use strict";

/* =========================================
   FITTRACK — CONFIGURAÇÕES E DADOS
========================================= */

const CHAVE_DADOS = "fittrack_treinos_v3";
const CHAVE_META = "fittrack_meta_semanal_v1";

const catalogo = {
    "Glúteos": [
        "Elevação pélvica",
        "Agachamento sumô",
        "Coice no cabo",
        "Abdução de quadril",
        "Glúteo na máquina",
        "Afundo"
    ],
    "Quadríceps e pernas": [
        "Agachamento livre",
        "Leg press",
        "Cadeira extensora",
        "Afundo búlgaro",
        "Passada",
        "Hack squat"
    ],
    "Posterior e panturrilhas": [
        "Mesa flexora",
        "Cadeira flexora",
        "Levantamento terra romeno",
        "Stiff",
        "Panturrilha em pé",
        "Panturrilha sentada"
    ],
    "Costas": [
        "Puxada frontal",
        "Remada baixa",
        "Remada unilateral",
        "Remada curvada",
        "Pulldown",
        "Barra fixa"
    ],
    "Peito": [
        "Supino reto",
        "Supino inclinado",
        "Crucifixo",
        "Crossover",
        "Flexão de braços",
        "Peck deck"
    ],
    "Ombros": [
        "Desenvolvimento",
        "Elevação lateral",
        "Elevação frontal",
        "Crucifixo inverso",
        "Face pull"
    ],
    "Bíceps e tríceps": [
        "Rosca direta",
        "Rosca martelo",
        "Rosca alternada",
        "Tríceps pulley",
        "Tríceps francês",
        "Tríceps testa"
    ],
    "Abdômen": [
        "Prancha",
        "Abdominal tradicional",
        "Elevação de pernas",
        "Abdominal na polia",
        "Abdominal bicicleta"
    ],
    "Cardio e condicionamento": [
        "Esteira",
        "Caminhada",
        "Corrida",
        "Bicicleta ergométrica",
        "Escada",
        "Elíptico",
        "Natação",
        "Treino funcional"
    ]
};

/*
 * Valores MET aproximados.
 * O gasto real depende da pessoa, execução,
 * condicionamento e intensidade da atividade.
 */
const valoresMET = {
    "Musculação": { leve: 2.5, moderada: 3.5, intensa: 6 },
    "Cardio": { leve: 3.5, moderada: 6, intensa: 9 },
    "Funcional": { leve: 3.5, moderada: 5, intensa: 8 },
    "Alongamento": { leve: 2, moderada: 2.5, intensa: 3 },
    "Outro": { leve: 2.5, moderada: 3.5, intensa: 5 }
};

const exerciciosCardio = {
    "Esteira": { leve: 2.8, moderada: 4.8, intensa: 8 },
    "Caminhada": { leve: 2.8, moderada: 3.8, intensa: 4.8 },
    "Corrida": { leve: 7, moderada: 9, intensa: 11.5 },
    "Bicicleta ergométrica": { leve: 4, moderada: 6.8, intensa: 10 },
    "Escada": { leve: 4, moderada: 7, intensa: 9 },
    "Elíptico": { leve: 4, moderada: 5.5, intensa: 7 },
    "Natação": { leve: 5, moderada: 7, intensa: 9.8 },
    "Treino funcional": { leve: 3.5, moderada: 5, intensa: 8 }
};

const mensagens = {
    inicio: {
        icone: "✦",
        titulo: "A consistência começa com uma decisão.",
        texto: "Não espere a motivação perfeita. Organize sua rotina e cumpra o próximo passo possível."
    },
    atrasado: {
        icone: "!",
        titulo: "Acorde para o seu objetivo.",
        texto: "Sua meta não será cumprida sozinha. Se você faltou a um treino planejado, reconheça isso, reorganize sua rotina e volte ao plano. Disciplina é continuar, não se punir."
    },
    quase: {
        icone: "↗",
        titulo: "Você está perto. Não pare agora.",
        texto: "Falta pouco para cumprir a meta semanal. Não deixe para depois o treino que ainda cabe na sua rotina — respeitando seu descanso e seus limites."
    },
    meta: {
        icone: "✓",
        titulo: "Meta cumprida. Trabalho feito!",
        texto: "Você transformou planejamento em ação. Continue com consistência, boa execução e recuperação adequada."
    },
    acima: {
        icone: "★",
        titulo: "Consistência em construção.",
        texto: "Você cumpriu sua meta. Lembre-se: treinar mais nem sempre significa evoluir mais. Priorize qualidade, progressão e descanso."
    },
    anterior: {
        icone: "↻",
        titulo: "Uma semana não define sua evolução.",
        texto: "O resultado não depende de perfeição. Veja o que atrapalhou sua rotina, ajuste o planejamento e retome o caminho."
    }
};

/* =========================================
   ELEMENTOS DA PÁGINA
========================================= */

const $ = (seletor) => document.querySelector(seletor);

const form = $("#form-treino");
const campoData = $("#data-treino");
const campoTipo = $("#tipo-treino");
const campoDuracao = $("#duracao");
const campoPeso = $("#peso");
const campoIntensidade = $("#intensidade");
const campoStatus = $("#status-treino");
const campoObservacoes = $("#observacoes");
const campoMeta = $("#meta-semanal");

const catalogoElement = $("#catalogo-exercicios");
const contadorExercicios = $("#contador-exercicios");
const listaHistorico = $("#lista-historico");
const feedbackForm = $("#feedback-form");

let treinos = carregarDados();
let idEmEdicao = null;

/* =========================================
   DATAS LOCAIS E SEMANAS
========================================= */

function dataLocalISO(data = new Date()) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function dataDoMeioDia(valor) {
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia, 12);
}

function inicioDaSemana(valor) {
    const data = dataDoMeioDia(valor);
    const diaSemana = data.getDay();
    const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana;

    data.setDate(data.getDate() + diferenca);
    return dataLocalISO(data);
}

function somarDias(valor, quantidade) {
    const data = dataDoMeioDia(valor);
    data.setDate(data.getDate() + quantidade);
    return dataLocalISO(data);
}

function formatarData(valor) {
    if (!valor) return "Data não informada";

    return dataDoMeioDia(valor).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatarIntervaloSemana(inicio) {
    const fim = somarDias(inicio, 6);
    const dataInicio = dataDoMeioDia(inicio);
    const dataFim = dataDoMeioDia(fim);

    const opcoes = { day: "2-digit", month: "2-digit" };

    return `${dataInicio.toLocaleDateString("pt-BR", opcoes)} – ${dataFim.toLocaleDateString("pt-BR", opcoes)}`;
}

function dataValida(valor) {
    if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return false;
    }

    const data = dataDoMeioDia(valor);
    return !Number.isNaN(data.getTime()) && dataLocalISO(data) === valor;
}

/* =========================================
   ARMAZENAMENTO LOCAL
========================================= */

function carregarDados() {
    try {
        const atual = localStorage.getItem(CHAVE_DADOS);

        if (atual) {
            const dados = JSON.parse(atual);
            return Array.isArray(dados) ? dados.filter(validarTreino) : [];
        }

        /*
         * Tenta importar os registros da versão anterior,
         * caso existam no navegador.
         */
        const anterior = localStorage.getItem("fittrack_treinos_v2");

        if (anterior) {
            const dadosAntigos = JSON.parse(anterior);

            if (Array.isArray(dadosAntigos)) {
                return dadosAntigos.map((treino) => ({
                    id: String(treino.id || criarId()),
                    data: dataValida(treino.data)
                        ? treino.data
                        : dataLocalISO(),
                    tipo: treino.tipo || "Musculação",
                    duracao: Number(treino.duracao) || 0,
                    peso: Number(treino.peso) || 74,
                    intensidade: treino.intensidade || "moderada",
                    exercicios: Array.isArray(treino.exercicios)
                        ? treino.exercicios
                        : [],
                    observacoes: String(treino.observacoes || ""),
                    status: treino.concluido === false
                        ? "planejado"
                        : "concluido",
                    calorias: Number(treino.calorias) || 0,
                    criadoEm: treino.criadoEm || new Date().toISOString()
                })).filter(validarTreino);
            }
        }

        return [];
    } catch (erro) {
        console.error("Não foi possível carregar os treinos:", erro);
        return [];
    }
}

function validarTreino(treino) {
    return Boolean(
        treino &&
        typeof treino.id === "string" &&
        dataValida(treino.data) &&
        Number.isFinite(Number(treino.duracao)) &&
        Number(treino.duracao) > 0
    );
}

function salvarDados() {
    try {
        localStorage.setItem(CHAVE_DADOS, JSON.stringify(treinos));
        return true;
    } catch (erro) {
        console.error("Não foi possível salvar os dados:", erro);
        mostrarFeedback(
            "Não foi possível salvar. Verifique o armazenamento do navegador.",
            true
        );
        return false;
    }
}

function criarId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function carregarMeta() {
    try {
        const metaSalva = Number(localStorage.getItem(CHAVE_META));
        return metaSalva >= 2 && metaSalva <= 7 ? metaSalva : 4;
    } catch {
        return 4;
    }
}

function salvarMeta() {
    try {
        localStorage.setItem(CHAVE_META, campoMeta.value);
    } catch (erro) {
        console.warn("Não foi possível salvar a meta:", erro);
    }
}

/* =========================================
   CATÁLOGO DE EXERCÍCIOS
========================================= */

function montarCatalogo() {
    catalogoElement.replaceChildren();

    Object.entries(catalogo).forEach(([grupo, exercicios], indice) => {
        const secao = document.createElement("section");
        secao.className = "muscle-group";

        const titulo = document.createElement("h4");
        titulo.textContent = grupo;
        secao.appendChild(titulo);

        const lista = document.createElement("div");
        lista.className = "exercise-list";

        exercicios.forEach((exercicio, numero) => {
            const id = `exercicio-${indice}-${numero}`;
            const label = document.createElement("label");
            label.className = "exercise-option";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "exercicios";
            checkbox.value = exercicio;
            checkbox.id = id;
            checkbox.addEventListener("change", atualizarContadorExercicios);

            const texto = document.createElement("span");
            texto.textContent = exercicio;

            label.append(checkbox, texto);
            lista.appendChild(label);
        });

        secao.appendChild(lista);
        catalogoElement.appendChild(secao);
    });
}

function atualizarContadorExercicios() {
    const quantidade = catalogoElement.querySelectorAll(
        'input[name="exercicios"]:checked'
    ).length;

    contadorExercicios.textContent =
        `${quantidade} ${quantidade === 1 ? "selecionado" : "selecionados"}`;
}

function exerciciosSelecionados() {
    return [...catalogoElement.querySelectorAll(
        'input[name="exercicios"]:checked'
    )].map((checkbox) => checkbox.value);
}

function definirExerciciosSelecionados(exercicios) {
    const selecionados = new Set(exercicios || []);

    catalogoElement.querySelectorAll('input[name="exercicios"]').forEach((checkbox) => {
        checkbox.checked = selecionados.has(checkbox.value);
    });

    atualizarContadorExercicios();
}

/* =========================================
   CÁLCULO ESTIMADO DE CALORIAS
========================================= */

function calcularCalorias(tipo, intensidade, peso, duracao, exercicios) {
    const exerciciosEscolhidos = exercicios || [];

    let met;

    if (tipo === "Musculação" && exerciciosEscolhidos.length > 0) {
        const cardioEscolhido = exerciciosEscolhidos.find(
            (nome) => exerciciosCardio[nome]
        );

        met = cardioEscolhido
            ? exerciciosCardio[cardioEscolhido][intensidade]
            : valoresMET["Musculação"][intensidade];
    } else {
        met = (valoresMET[tipo] || valoresMET["Outro"])[intensidade];
    }

    const calorias = met * 3.5 * Number(peso) / 200 * Number(duracao);

    return Math.max(0, Math.round(calorias));
}

/* =========================================
   RESUMOS DA SEMANA
========================================= */

function treinosDaSemana(inicio, fim = somarDias(inicio, 6)) {
    return treinos.filter((treino) => (
        treino.data >= inicio &&
        treino.data <= fim &&
        treino.status === "concluido"
    ));
}

function atualizarIndice() {
    const hoje = dataLocalISO();
    const inicioAtual = inicioDaSemana(hoje);
    const fimAtual = somarDias(inicioAtual, 6);
    const inicioAnterior = somarDias(inicioAtual, -7);
    const fimAnterior = somarDias(inicioAtual, -1);

    const meta = Number(campoMeta.value);
    const destaSemana = treinosDaSemana(inicioAtual, fimAtual);
    const semanaPassada = treinosDaSemana(inicioAnterior, fimAnterior);

    const minutos = destaSemana.reduce(
        (soma, treino) => soma + Number(treino.duracao), 0
    );

    const calorias = destaSemana.reduce(
        (soma, treino) => soma + Number(treino.calorias || 0), 0
    );

    const quantidade = destaSemana.length;
    const indice = Math.min(100, Math.round(quantidade / meta * 100));
    const porcentagemMeta = Math.min(100, Math.round(quantidade / meta * 100));

    $("#indice-valor").textContent = indice;
    $("#score-ring").style.setProperty("--score-angle", `${indice * 3.6}deg`);
    $("#score-ring").setAttribute("aria-label", `Índice semanal: ${indice} de 100`);
    $("#barra-meta").style.width = `${porcentagemMeta}%`;
    $("#progresso-meta").textContent = `${quantidade} de ${meta} treinos concluídos`;
    $("#total-treinos").textContent = quantidade;
    $("#total-minutos").textContent = `${minutos} min`;
    $("#total-calorias").textContent = `${calorias.toLocaleString("pt-BR")} kcal`;
    $("#intervalo-semana").textContent = formatarIntervaloSemana(inicioAtual);

    if (quantidade >= meta) {
        $("#status-indice").textContent = "Meta semanal cumprida!";
        $("#texto-indice").textContent = "Você atingiu sua meta de treinos nesta semana.";
    } else if (quantidade === 0) {
        $("#status-indice").textContent = "Vamos começar?";
        $("#texto-indice").textContent = "Ainda há tempo para dar o primeiro passo.";
    } else if (indice >= 75) {
        $("#status-indice").textContent = "Você está quase lá!";
        $("#texto-indice").textContent = "Mantenha o foco para concluir sua meta.";
    } else {
        $("#status-indice").textContent = "Continue construindo";
        $("#texto-indice").textContent = "Cada sessão concluída conta para sua consistência.";
    }

    const diferenca = quantidade - semanaPassada.length;

    if (semanaPassada.length === 0) {
        $("#comparacao-semanal").textContent =
            "Sem treinos concluídos na semana anterior para comparar.";
    } else if (diferenca > 0) {
        $("#comparacao-semanal").textContent =
            `+${diferenca} ${diferenca === 1 ? "treino" : "treinos"} concluído(s)`;
    } else if (diferenca < 0) {
        $("#comparacao-semanal").textContent =
            `${diferenca} ${diferenca === -1 ? "treino" : "treinos"} em relação à semana anterior`;
    } else {
        $("#comparacao-semanal").textContent =
            "Mesmo número de treinos da semana anterior.";
    }

    atualizarMotivacao(quantidade, meta, indice, diferenca, semanaPassada.length);
    montarSemana(inicioAtual);
}

function atualizarMotivacao(quantidade, meta, indice, diferenca, totalAnterior) {
    let mensagem;

    if (quantidade >= meta) {
        mensagem = quantidade > meta ? mensagens.acima : mensagens.meta;
    } else if (quantidade === 0 && totalAnterior > 0 && diferenca < 0) {
        mensagem = mensagens.anterior;
    } else if (quantidade > 0 && indice >= 75) {
        mensagem = mensagens.quase;
    } else if (quantidade === 0) {
        mensagem = mensagens.inicio;
    } else {
        mensagem = mensagens.atrasado;
    }

    $("#icone-motivacao").textContent = mensagem.icone;
    $("#titulo-motivacao").textContent = mensagem.titulo;
    $("#mensagem-motivacao").textContent = mensagem.texto;
}

function montarSemana(inicio) {
    const nomes = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
    const hoje = dataLocalISO();
    const grade = $("#grade-semana");

    grade.replaceChildren();

    nomes.forEach((nome, indice) => {
        const data = somarDias(inicio, indice);
        const doDia = treinos.filter((treino) => treino.data === data);
        const concluidos = doDia.filter((treino) => treino.status === "concluido").length;
        const planejados = doDia.filter((treino) => treino.status === "planejado").length;

        const card = document.createElement("div");
        card.className = "day-card";

        if (data === hoje) card.classList.add("today");
        if (concluidos > 0) card.classList.add("done");
        else if (planejados > 0) card.classList.add("planned");

        const nomeEl = document.createElement("span");
        nomeEl.className = "day-name";
        nomeEl.textContent = nome;

        const numeroEl = document.createElement("span");
        numeroEl.className = "day-number";
        numeroEl.textContent = dataDoMeioDia(data).getDate();

        const statusEl = document.createElement("span");
        statusEl.className = "day-status";

        if (concluidos > 0) {
            statusEl.textContent = `${concluidos} ✓`;
        } else if (planejados > 0) {
            statusEl.textContent = "Planejado";
        } else {
            statusEl.textContent = "—";
        }

        card.append(nomeEl, numeroEl, statusEl);
        grade.appendChild(card);
    });
}

/* =========================================
   MENSAGENS E FORMULÁRIO
========================================= */

function mostrarFeedback(mensagem, erro = false) {
    feedbackForm.textContent = mensagem;
    feedbackForm.classList.toggle("error", erro);
}

function limparFeedback() {
    feedbackForm.textContent = "";
    feedbackForm.classList.remove("error");
}

function limparFormulario() {
    form.reset();
    campoData.value = dataLocalISO();
    campoPeso.value = "74";
    campoIntensidade.value = "moderada";
    campoStatus.value = "concluido";
    definirExerciciosSelecionados([]);
}

function cancelarEdicao() {
    idEmEdicao = null;
    limparFormulario();
    limparFeedback();

    $("#botao-salvar").textContent = "Salvar treino";
    $("#botao-cancelar").classList.add("hidden");
}

function iniciarEdicao(id) {
    const treino = treinos.find((item) => item.id === id);
    if (!treino) return;

    idEmEdicao = id;

    campoData.value = treino.data;
    campoTipo.value = treino.tipo;
    campoDuracao.value = treino.duracao;
    campoPeso.value = treino.peso;
    campoIntensidade.value = treino.intensidade;
    campoStatus.value = treino.status;
    campoObservacoes.value = treino.observacoes || "";

    definirExerciciosSelecionados(treino.exercicios || []);

    $("#botao-salvar").textContent = "Salvar alterações";
    $("#botao-cancelar").classList.remove("hidden");

    mostrarFeedback("Editando treino. Faça as alterações e salve.");
    $("#registrar").scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    limparFeedback();

    const data = campoData.value;
    const tipo = campoTipo.value;
    const duracao = Number(campoDuracao.value);
    const peso = Number(campoPeso.value);
    const intensidade = campoIntensidade.value;
    const status = campoStatus.value;
    const exercicios = exerciciosSelecionados();
    const observacoes = campoObservacoes.value.trim();

    if (!dataValida(data)) {
        mostrarFeedback("Escolha uma data válida.", true);
        return;
    }

    if (!Number.isFinite(duracao) || duracao <= 0 || duracao > 600) {
        mostrarFeedback("Informe uma duração entre 1 e 600 minutos.", true);
        return;
    }

    if (!Number.isFinite(peso) || peso < 25 || peso > 350) {
        mostrarFeedback("Informe um peso válido entre 25 e 350 kg.", true);
        return;
    }

    if (idEmEdicao === null && data > dataLocalISO() && status === "concluido") {
        mostrarFeedback("Uma data futura não pode ser marcada como treino concluído.", true);
        return;
    }

    if (data > dataLocalISO() && status === "concluido") {
        mostrarFeedback("Para uma data futura, use o status planejado.", true);
        return;
    }

    const treino = {
        id: idEmEdicao || criarId(),
        data,
        tipo,
        duracao,
        peso,
        intensidade,
        exercicios,
        observacoes,
        status,
        calorias: calcularCalorias(tipo, intensidade, peso, duracao, exercicios),
        criadoEm: new Date().toISOString()
    };

    const indiceAntigo = treinos.findIndex((item) => item.id === idEmEdicao);

    if (indiceAntigo >= 0) {
        treinos[indiceAntigo] = {
            ...treinos[indiceAntigo],
            ...treino
        };
    } else {
        treinos.push(treino);
    }

    if (!salvarDados()) {
        if (indiceAntigo >= 0) {
            treinos.splice(indiceAntigo, 1);
        } else {
            treinos = treinos.filter((item) => item.id !== treino.id);
        }

        renderizarTudo();
        return;
    }

    cancelarEdicao();
    renderizarTudo();
    mostrarFeedback(
        indiceAntigo >= 0
            ? "Treino atualizado com sucesso!"
            : "Treino registrado com sucesso!"
    );
});

$("#botao-cancelar").addEventListener("click", cancelarEdicao);

campoMeta.addEventListener("change", () => {
    salvarMeta();
    atualizarIndice();
});

/* =========================================
   HISTÓRICO, EDIÇÃO E EXCLUSÃO
========================================= */

function criarBotao(texto, classe, acao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = `small-button ${classe || ""}`.trim();
    botao.textContent = texto;
    botao.addEventListener("click", acao);
    return botao;
}

function montarHistorico() {
    listaHistorico.replaceChildren();

    const ordenados = [...treinos].sort((a, b) => {
        if (a.data !== b.data) return b.data.localeCompare(a.data);
        return String(b.criadoEm || "").localeCompare(String(a.criadoEm || ""));
    });

    if (ordenados.length === 0) {
        const vazio = document.createElement("div");
        vazio.className = "empty-state";

        const titulo = document.createElement("strong");
        titulo.textContent = "Seu histórico começa aqui.";

        const texto = document.createElement("span");
        texto.textContent = "Registre seu primeiro treino para acompanhar sua evolução.";

        vazio.append(titulo, texto);
        listaHistorico.appendChild(vazio);
        return;
    }

    ordenados.forEach((treino) => {
        const card = document.createElement("article");
        card.className = "history-card";

        const principal = document.createElement("div");
        principal.className = "history-main";

        const linhaTitulo = document.createElement("div");
        linhaTitulo.className = "history-title-row";

        const titulo = document.createElement("h3");
        titulo.textContent = treino.tipo;

        const status = document.createElement("span");
        status.className = `status-badge ${treino.status}`;
        status.textContent = treino.status === "concluido" ? "Concluído" : "Planejado";

        linhaTitulo.append(titulo, status);

        const meta = document.createElement("div");
        meta.className = "history-meta";

        [
            formatarData(treino.data),
            `${treino.duracao} min`,
            `${Number(treino.calorias || 0).toLocaleString("pt-BR")} kcal estimadas`,
            `${treino.peso} kg`,
            `Intensidade ${treino.intensidade}`
        ].forEach((item) => {
            const span = document.createElement("span");
            span.textContent = item;
            meta.appendChild(span);
        });

        principal.append(linhaTitulo, meta);

        if (treino.exercicios && treino.exercicios.length > 0) {
            const exercicios = document.createElement("p");
            exercicios.className = "history-exercises";
            exercicios.textContent = `Exercícios: ${treino.exercicios.join(", ")}`;
            principal.appendChild(exercicios);
        }

        if (treino.observacoes) {
            const observacoes = document.createElement("p");
            observacoes.className = "history-notes";
            observacoes.textContent = `Observações: ${treino.observacoes}`;
            principal.appendChild(observacoes);
        }

        const acoes = document.createElement("div");
        acoes.className = "history-actions";

        if (treino.status === "planejado") {
            acoes.appendChild(criarBotao("Concluir", "", () => alterarStatus(treino.id)));
        }

        acoes.appendChild(criarBotao("Editar", "", () => iniciarEdicao(treino.id)));

        acoes.appendChild(criarBotao("Excluir", "delete", () => excluirTreino(treino.id)));

        card.append(principal, acoes);
        listaHistorico.appendChild(card);
    });
}

function alterarStatus(id) {
    const indice = treinos.findIndex((treino) => treino.id === id);
    if (indice < 0) return;

    const treino = treinos[indice];

    if (treino.status === "concluido") return;

    if (treino.data > dataLocalISO()) {
        alert("Esse treino está marcado para uma data futura. Ajuste a data antes de concluí-lo.");
        return;
    }

    const copiaAnterior = { ...treino };
    treinos[indice] = { ...treino, status: "concluido" };

    if (!salvarDados()) {
        treinos[indice] = copiaAnterior;
        return;
    }

    renderizarTudo();
}

function excluirTreino(id) {
    const treino = treinos.find((item) => item.id === id);
    if (!treino) return;

    const confirmar = confirm(
        `Deseja excluir o treino de ${formatarData(treino.data)}?`
    );

    if (!confirmar) return;

    const copiaAnterior = [...treinos];
    treinos = treinos.filter((item) => item.id !== id);

    if (!salvarDados()) {
        treinos = copiaAnterior;
        renderizarTudo();
        return;
    }

    if (idEmEdicao === id) cancelarEdicao();

    renderizarTudo();
}

$("#limpar-historico").addEventListener("click", () => {
    if (treinos.length === 0) {
        alert("Seu histórico já está vazio.");
        return;
    }

    const confirmar = confirm(
        "Tem certeza de que deseja apagar todo o histórico? Essa ação não pode ser desfeita."
    );

    if (!confirmar) return;

    const copiaAnterior = [...treinos];
    treinos = [];

    if (!salvarDados()) {
        treinos = copiaAnterior;
        renderizarTudo();
        return;
    }

    cancelarEdicao();
    renderizarTudo();
});

/* =========================================
   INICIALIZAÇÃO
========================================= */

function renderizarTudo() {
    montarHistorico();
    atualizarIndice();
}

function iniciarFitTrack() {
    campoData.value = dataLocalISO();
    campoMeta.value = String(carregarMeta());

    montarCatalogo();
    limparFormulario();
    renderizarTudo();
}

iniciarFitTrack();
