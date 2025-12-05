const SUPABASE_URL = "https://smvlyewxhrihqqcaegnr.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdmx5ZXd4aHJpaHFxY2FlZ25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTQxNzYsImV4cCI6MjA3OTc5MDE3Nn0.GYQCiJGV42ud8agWyuQ_6uLswmxFPaL6tVdm3VIN8g8";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const ESCOLAS_SEOM = [
    "Unidade Regional De Ensino - Suzano",
    "ALFREDO ROBERTO",
    "ALICE ROMANOS PROFª",
    "ANDERSON DA SILVA SOARES",
    "ANGELA SUELI P DIAS",
    "ANIS FADUL DOUTOR",
    "ANTONIO BRASILIO MENEZES DA FONSECA PROF",
    "ANTONIO GARCIA VEREADOR",
    "ANTONIO JOSE CAMPOS DE MENEZES PROF",
    "ANTONIO RODRIGUES DE ALMEIDA",
    "ANTONIO VALDEMAR GALO VEREADOR",
    "BATISTA RENZI",
    "BENEDITA DE CAMPOS MARCOLONGO PROFª",
    "BRASILIO MACHADO NETO COMENDADOR",
    "CARLINDO REIS",
    "CARLOS MOLTENI PROF",
    "CHOJIRO SEGAWA",
    "DAVID JORGE CURI PROF",
    "EDIR DO COUTO ROSA",
    "ELIANE APARECIDA D DA SILVA",
    "EUCLIDES IGESCA",
    "GERALDO JUSTINIANO DE REZENDE SILVA PROF",
    "GILBERTO DE CARVALHO PROF",
    "GIOVANNI BATTISTA RAFFO PROF DOUTOR",
    "HELENA ZERRENNER",
    "IIJIMA",
    "IGNES CORREA ALLEN",
    "JACQUES YVES COUSTEAU COMANDANTE",
    "JANDYRA COUTINHO PROFª",
    "JARDIM SAO PAULO II",
    "JOSE BENEDITO LEITE BARTHOLOMEI PROF",
    "JOSE CAMILO DE ANDRADE",
    "JOSE PAPAIZ PROF",
    "JOVIANO SATLER DE LIMA PROF",
    "JUSSARA FEITOSA DOMSCHKE PROFª",
    "Justino Marcondes Rangel",
    "Landia dos Santos Batista",
    "LEDA FERNANDES LOPES PROFª",
    "LUCY FRANCO KOWALSKI PROFª",
    "LUIZ BIANCONI",
    "LUIZA HIDAKA PROFª",
    "MANUEL DOS SANTOS PAIVA",
    "MARIA ELISA DE AZEVEDO CINTRA PROFª",
    "Mario Manoel Dantas de Aquino",
    "MARTHA CALIXTO CAZAGRANDE",
    "MASAITI SEKINE PROF",
    "MORATO DE OLIVEIRA DOUTOR",
    "OLAVO LEONEL FERREIRA PROF",
    "OLZANETTI GOMES PROFESSOR",
    "OSWALDO DE OLIVEIRA LIMA",
    "PARQUE DOURADO II",
    "PAULO AMERICO PAGANUCCI",
    "PAULO KOBAYASHI PROF",
    "RAUL BRASIL PROF EE",
    "RAUL BRASIL PROF",
    "ROBERTO BIANCHI",
    "SEBASTIAO PEREIRA VIDAL",
    "TOCHICHICO YOCHICAVA PROF",
    "TOKUZO TERAZAKI",
    "YOLANDA BASSI PROFª",
    "ZELIA GATTAI AMADO",
    "ZEIKICHI FUKUOKA"
];

let registros = [];
let editingId = null;

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    popularSelectsEscolas();
    setupTemaToggle();
    setupForm();
    popularSelectFiltroEscolas();
    setupFiltros();
    carregarRegistros();
    atualizarRotuloBotao();
});

function setupNavigation() {
    const buttons = document.querySelectorAll(".nav-btn");
    const sections = {
        cadastro: document.getElementById("cadastro-view"),
        painel: document.getElementById("painel-view")
    };

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view;

            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            Object.keys(sections).forEach(key => {
                sections[key].classList.toggle("active", key === view);
            });
        });
    });
}
function navegarParaCadastro() {
    const btnCadastro = document.querySelector('.nav-btn[data-view="cadastro"]');
    if (btnCadastro) btnCadastro.click();
}

function popularSelectsEscolas() {
    const selects = document.querySelectorAll("select.select-escola");

    selects.forEach(select => {
        select.innerHTML = "";

        const optDefault = document.createElement("option");
        optDefault.value = "";
        optDefault.textContent = "Selecione a escola / URE";
        select.appendChild(optDefault);

        ESCOLAS_SEOM.forEach(nome => {
            const opt = document.createElement("option");
            opt.value = nome;
            opt.textContent = nome;
            select.appendChild(opt);
        });
    });
}

function popularSelectFiltroEscolas() {
    const filtroEscola = document.getElementById("filter-escola");
    if (!filtroEscola) return;

    filtroEscola.innerHTML = "";

    const optAll = document.createElement("option");
    optAll.value = "";
    optAll.textContent = "Todas";
    filtroEscola.appendChild(optAll);

    ESCOLAS_SEOM.forEach(nome => {
        const opt = document.createElement("option");
        opt.value = nome;
        opt.textContent = nome;
        filtroEscola.appendChild(opt);
    });
}

function setupTemaToggle() {
    const selectTema = document.getElementById("tema");
    const sectionsTema = document.querySelectorAll(".tema-section");

    function atualizarSecoes() {
        const tema = selectTema.value;
        sectionsTema.forEach(sec => {
            const secTema = sec.dataset.tema;
            sec.style.display = secTema === tema ? "grid" : "none";
        });
    }

    selectTema.addEventListener("change", atualizarSecoes);
    atualizarSecoes();
}

function setupForm() {
    const form = document.getElementById("cadastro-form");

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const tema = document.getElementById("tema").value;
        if (!tema) {
            alert("Selecione um tema antes de salvar.");
            return;
        }

        const payload = montarPayloadPorTema(tema);
        if (!payload) {
            alert("Preencha pelo menos os campos principais do tema selecionado.");
            return;
        }

        const anexosFiles = coletarArquivosDoTema(tema);

        try {
            if (editingId) {
                await atualizarRegistro(editingId, payload, tema, anexosFiles);
                alert("Registro atualizado com sucesso!");
            } else {
                await salvarRegistro(payload, tema, anexosFiles);
                alert("Registro salvo com sucesso!");
            }

            resetForm();
        } catch (error) {
            console.error("Erro ao salvar/atualizar registro:", error);
            alert("Erro ao salvar/atualizar registro. Verifique o console.");
        }
    });
}

function resetForm() {
    const form = document.getElementById("cadastro-form");
    form.reset();
    document.getElementById("tema").dispatchEvent(new Event("change"));
    editingId = null;
    atualizarRotuloBotao();
}

function atualizarRotuloBotao() {
    const form = document.getElementById("cadastro-form");
    if (!form) return;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    submitBtn.textContent = editingId ? "Atualizar registro" : "Salvar registro";
}

function montarPayloadPorTema(tema) {
    const agora = new Date().toISOString();

    const base = {
        tipo: tema,
        escola: null,
        status: null,
        descricao: null,
        data_referencia: null,
        numero_solicitacao: null,
        numero_sei: null,
        data_solicitacao: null,
        data_abertura_obra: null,
        contratante: null,
        tema_visita: null,
        observacao_extra: null
    };

    if (tema === "obras") {
        const numeroSolicitacao = valueTrim("obras-numero-solicitacao");
        const escola = valueTrim("obras-escola");
        const assunto = valueTrim("obras-assunto");
        const situacao = document.getElementById("obras-situacao").value;
        const obsSituacao = valueTrim("obras-observacao");
        const dataSolicitacao = valueTrim("obras-data-solicitacao");
        const dataAbertura = valueTrim("obras-data-abertura");
        const contratante = valueTrim("obras-contratante");

        if (!numeroSolicitacao && !escola && !assunto) return null;

        return {
            ...base,
            escola: escola || null,
            status: situacao || null,
            descricao: assunto || obsSituacao || null,
            data_referencia: dataSolicitacao || dataAbertura || null,
            numero_solicitacao: numeroSolicitacao || null,
            data_solicitacao: dataSolicitacao || null,
            data_abertura_obra: dataAbertura || null,
            contratante: contratante || null,
            observacao_extra: obsSituacao || null,
            created_at: agora
        };
    }

    if (tema === "solicitacao") {
        const numeroSei = valueTrim("solicitacao-numero-sei");
        const escola = valueTrim("solicitacao-escola");
        const status = document.getElementById("solicitacao-status").value;
        const observacao = valueTrim("solicitacao-observacao");

        if (!numeroSei && !escola) return null;

        return {
            ...base,
            escola: escola || null,
            status: status || null,
            descricao: observacao || (numeroSei ? `Nº SEI: ${numeroSei}` : null),
            data_referencia: null,
            numero_sei: numeroSei || null,
            observacao_extra: observacao || null,
            created_at: agora
        };
    }

    if (tema === "termo" || tema === "bi_manutencao") {
        const prefix = tema === "termo" ? "termo" : "bi";

        const escola = valueTrim(`${prefix}-escola`);
        const dataVisita = valueTrim(`${prefix}-data`);
        const temaVisita = document.getElementById(`${prefix}-tema`).value;
        const observacao = valueTrim(`${prefix}-observacao`);

        if (!escola && !dataVisita && !observacao) return null;

        return {
            ...base,
            escola: escola || null,
            status: null,
            descricao: observacao || (tema === "termo" ? "Termo de visita" : "BI manutenção predial"),
            data_referencia: dataVisita || null,
            tema_visita: temaVisita || null,
            observacao_extra: observacao || null,
            created_at: agora
        };
    }

    return null;
}

function valueTrim(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    return (el.value || "").trim();
}

function coletarArquivosDoTema(tema) {
    if (tema === "obras") {
        const input = document.getElementById("obras-anexos");
        return input ? input.files : null;
    }
    if (tema === "solicitacao") {
        const input = document.getElementById("solicitacao-anexos");
        return input ? input.files : null;
    }
    if (tema === "termo") {
        const input = document.getElementById("termo-anexos");
        return input ? input.files : null;
    }
    if (tema === "bi_manutencao") {
        const input = document.getElementById("bi-anexos");
        return input ? input.files : null;
    }
    return null;
}

async function processarAnexosParaRegistro(registro, tema, fileList, modo = "append") {
    const existentes = Array.isArray(registro.anexos) ? registro.anexos : [];
    const novos = await uploadAnexosParaRegistro(registro.id, tema, fileList);

    if (!novos.length) return registro;

    let anexosAtualizados;
    if (modo === "replace") {
        anexosAtualizados = novos;
    } else {
        anexosAtualizados = existentes.concat(novos);
    }

    const { data, error } = await supabaseClient
        .from("seom_registros")
        .update({ anexos: anexosAtualizados })
        .eq("id", registro.id)
        .select()
        .single();

    if (error) {
        console.error("Erro ao salvar metadados dos anexos:", error);
        return { ...registro, anexos: anexosAtualizados };
    }

    return data;
}

async function uploadAnexosParaRegistro(registroId, tema, fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return [];

    const uploads = files.map(async file => {
        const sanitizedName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${registroId}/${Date.now()}-${sanitizedName}`;

        const { error } = await supabaseClient
            .storage
            .from("seom_anexos")
            .upload(path, file);

        if (error) {
            console.error("Erro ao fazer upload de anexo:", error);
            return null;
        }

        const { data } = supabaseClient
            .storage
            .from("seom_anexos")
            .getPublicUrl(path);

        const publicUrl = data?.publicUrl || null;

        return {
            path,
            url: publicUrl,
            nome: file.name,
            tamanho: file.size,
            tipo: file.type,
            tema,
            uploaded_at: new Date().toISOString()
        };
    });

    const resultados = await Promise.all(uploads);
    return resultados.filter(Boolean);
}

async function carregarRegistros() {
    try {
        const { data, error } = await supabaseClient
            .from("seom_registros")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao carregar registros:", error);
            registros = [];
        } else {
            registros = data || [];
        }
    } catch (err) {
        console.error("Erro inesperado ao carregar registros:", err);
        registros = [];
    }

    renderTabela();
}

async function salvarRegistro(payload, tema, anexosFiles) {
    const { data, error } = await supabaseClient
        .from("seom_registros")
        .insert(payload)
        .select()
        .single();

    if (error) {
        throw error;
    }

    let registro = data;

    if (anexosFiles && anexosFiles.length) {
        registro = await processarAnexosParaRegistro(registro, tema, anexosFiles, "append");
    }

    registros.unshift(registro);
    renderTabela();
}

async function atualizarRegistro(id, payload, tema, anexosFiles) {
    const payloadUpdate = { ...payload };
    delete payloadUpdate.created_at;
    delete payloadUpdate.anexos;

    const { data, error } = await supabaseClient
        .from("seom_registros")
        .update(payloadUpdate)
        .eq("id", id)
        .select();

    if (error) {
        throw error;
    }

    if (!data || !data.length) {
        throw new Error("Nenhuma linha atualizada. Verifique RLS e ID.");
    }

    let registro = data[0];

    if (anexosFiles && anexosFiles.length) {
        registro = await processarAnexosParaRegistro(registro, tema, anexosFiles, "replace");
    }

    registros = registros.map(r => (r.id === registro.id ? registro : r));
    renderTabela();
}

async function excluirRegistro(id) {
    try {
        const { error } = await supabaseClient
            .from("seom_registros")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Erro ao excluir registro:", error);
            alert("Erro ao excluir registro. Verifique o console.");
            return;
        }

        registros = registros.filter(r => r.id !== id);
        renderTabela();
    } catch (err) {
        console.error("Erro inesperado ao excluir:", err);
        alert("Erro inesperado ao excluir. Verifique o console.");
    }
}

function entrarModoEdicao(registro) {
    editingId = registro.id;
    atualizarRotuloBotao();
    navegarParaCadastro();

    const selectTema = document.getElementById("tema");
    selectTema.value = registro.tipo;
    selectTema.dispatchEvent(new Event("change"));

    if (registro.tipo === "obras") {
        document.getElementById("obras-numero-solicitacao").value =
            registro.numero_solicitacao || "";
        document.getElementById("obras-escola").value =
            registro.escola || "";
        document.getElementById("obras-assunto").value =
            registro.descricao || "";
        document.getElementById("obras-situacao").value =
            registro.status || "";
        document.getElementById("obras-observacao").value =
            registro.observacao_extra || "";
        document.getElementById("obras-data-solicitacao").value =
            registro.data_solicitacao || "";
        document.getElementById("obras-data-abertura").value =
            registro.data_abertura_obra || "";
        document.getElementById("obras-contratante").value =
            registro.contratante || "";
    }

    if (registro.tipo === "solicitacao") {
        document.getElementById("solicitacao-numero-sei").value =
            registro.numero_sei || "";
        document.getElementById("solicitacao-escola").value =
            registro.escola || "";
        document.getElementById("solicitacao-status").value =
            registro.status || "";
        document.getElementById("solicitacao-observacao").value =
            registro.observacao_extra || registro.descricao || "";
    }

    if (registro.tipo === "termo" || registro.tipo === "bi_manutencao") {
        const prefix = registro.tipo === "termo" ? "termo" : "bi";

        document.getElementById(`${prefix}-escola`).value =
            registro.escola || "";
        document.getElementById(`${prefix}-data`).value =
            registro.data_referencia || "";
        document.getElementById(`${prefix}-tema`).value =
            registro.tema_visita || "";
        document.getElementById(`${prefix}-observacao`).value =
            registro.observacao_extra || registro.descricao || "";
    }
}

function setupFiltros() {
    const filtros = document.querySelectorAll(".filter");
    filtros.forEach(f => {
        f.addEventListener("change", () => {
            renderTabela();
        });
    });
}

function renderTabela() {
    const tbody = document.querySelector("#registros-table tbody");
    const emptyState = document.getElementById("empty-state");

    if (!tbody) return;

    tbody.innerHTML = "";

    const registrosFiltrados = filtrarRegistros();

    if (!registrosFiltrados.length) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    registrosFiltrados.forEach(registro => {
        const tr = document.createElement("tr");

        const tdTema = document.createElement("td");
        tdTema.textContent = labelTema(registro.tipo);
        tr.appendChild(tdTema);

        const tdEscola = document.createElement("td");
        tdEscola.textContent = registro.escola || "-";
        tr.appendChild(tdEscola);

        const tdDescricao = document.createElement("td");
        tdDescricao.textContent = resumoDescricao(registro.descricao);
        tr.appendChild(tdDescricao);

        const tdStatus = document.createElement("td");
        if (registro.status) {
            const span = document.createElement("span");
            span.className = `badge ${registro.status}`;
            span.textContent = labelStatus(registro.status);
            tdStatus.appendChild(span);
        } else {
            tdStatus.textContent = "-";
        }
        tr.appendChild(tdStatus);

        const tdData = document.createElement("td");
        tdData.textContent = formatarData(registro.data_referencia || registro.created_at);
        tr.appendChild(tdData);

        const tdAnexos = document.createElement("td");
        const anexos = Array.isArray(registro.anexos) ? registro.anexos : [];

        if (!anexos.length) {
            tdAnexos.textContent = "-";
        } else {
            const countSpan = document.createElement("div");
            countSpan.className = "anexos-count";
            countSpan.textContent = `${anexos.length} arquivo(s)`;
            tdAnexos.appendChild(countSpan);

            const linksWrapper = document.createElement("div");
            linksWrapper.className = "anexos-links";

            anexos.forEach((anexo, index) => {
                if (!anexo || !anexo.url) return;

                const link = document.createElement("a");
                link.href = anexo.url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.className = "anexo-pill";
                link.textContent = anexo.nome || `Arquivo ${index + 1}`;

                linksWrapper.appendChild(link);
            });

            tdAnexos.appendChild(linksWrapper);
        }

        tr.appendChild(tdAnexos);

        const tdAcoes = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "table-actions";

        const btnEditar = document.createElement("button");
        btnEditar.className = "action-btn";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", () => {
            entrarModoEdicao(registro);
        });

        const btnExcluir = document.createElement("button");
        btnExcluir.className = "action-btn danger";
        btnExcluir.textContent = "Excluir";
        btnExcluir.addEventListener("click", () => {
            if (confirm("Deseja realmente excluir este registro?")) {
                excluirRegistro(registro.id);
            }
        });

        actions.appendChild(btnEditar);
        actions.appendChild(btnExcluir);
        tdAcoes.appendChild(actions);
        tr.appendChild(tdAcoes);

        tbody.appendChild(tr);
    });
}

function filtrarRegistros() {
    const temaFiltro = document.getElementById("filter-tema").value;
    const escolaFiltro = document.getElementById("filter-escola").value;
    const statusFiltro = document.getElementById("filter-status").value;

    return registros.filter(r => {
        const okTema = !temaFiltro || r.tipo === temaFiltro;
        const okEscola = !escolaFiltro || r.escola === escolaFiltro;
        const okStatus = !statusFiltro || r.status === statusFiltro;
        return okTema && okEscola && okStatus;
    });
}

function labelTema(tipo) {
    switch (tipo) {
        case "obras":
            return "Obras e manutenção";
        case "solicitacao":
            return "Solicitação de manutenção";
        case "termo":
            return "Termo de visita";
        case "bi_manutencao":
            return "BI manutenção predial";
        default:
            return tipo || "-";
    }
}

function labelStatus(status) {
    switch (status) {
        case "em_andamento":
            return "Em andamento";
        case "nao_atendido":
            return "Não atendido";
        case "concluido":
            return "Concluído";
        default:
            return status || "-";
    }
}


function resumoDescricao(texto, limite = 80) {
    if (!texto) return "-";
    if (texto.length <= limite) return texto;
    return texto.slice(0, limite - 3) + "...";
}

function formatarData(valor) {
    if (!valor) return "-";
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        const [ano, mes, dia] = valor.split("-");
        return `${dia}/${mes}/${ano}`;
    }
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return "-";

    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}
