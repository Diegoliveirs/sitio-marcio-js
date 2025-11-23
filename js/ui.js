const DOMINIO_ADMIN = window.location.hostname;
let MODO_PUBLICO = false;

function verificarAcessoPorDominio() {
    const hostAtual = window.location.hostname;
    if (hostAtual !== "sitiomarcio.app" && hostAtual !== "localhost" && hostAtual !== "127.0.0.1") {
        MODO_PUBLICO = true;
        aplicarModoPublico();
    } else {
        mostrarTela("tela-login"); 
    }
}

function aplicarModoPublico() {
    mostrarTela("tela-calendario");

    const rodapeAdmin = document.getElementById("rodape");
    if (rodapeAdmin) {
        rodapeAdmin.style.display = 'none';
    }

    const rodapePublico = document.getElementById("legenda-publica");
    if (rodapePublico) {
        rodapePublico.style.display = 'flex';
    }
}

function abrirWhatsApp() {
    const numeroTelefone = "5585981808296";
    const mensagem = "Olá, gostaria de mais informações sobre as datas disponíveis no Sítio do Márcio.";

    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroTelefone}&text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, "_blank");
}

function mostrarTela(idTela) {
    const telas = ["tela-login", "tela-menu", "tela-cadastro-reserva", "tela-cadastro-usuarios", "tela-listar-reservas", "tela-calendario", "tela-detalhes-reserva", "tela-configuracoes", "tela-financas"];
    const rodape = document.getElementById("rodape");

    const telaParaIcone = {
        "tela-menu": "icone-menu",
        "tela-calendario": "icone-calendario",
        "tela-configuracoes": "icone-configuracoes",
        "tela-cadastro-reserva": "icone-calendario",
        "tela-listar-reservas": "icone-calendario",
        "tela-detalhes-reserva": "icone-calendario",
        "tela-cadastro-usuarios": "icone-menu",
        "tela-financas": "icone-menu" 
    };

    telas.forEach(tela => {
        const el = document.getElementById(tela);
        if (el) el.style.display = 'none';
    });
    
    const telaAtiva = document.getElementById(idTela);
    if (telaAtiva) telaAtiva.style.display = 'block';

    if (idTela === "tela-login" && rodape) {
        rodape.style.display = 'none';
    } else if (rodape && !MODO_PUBLICO) { 
        rodape.style.display = 'flex';
    }

    const icones = document.querySelectorAll("#rodape .rodape-icone");
    icones.forEach(icone => {
        icone.classList.remove("ativo-icone");
    });

    const iconeAtivoId = telaParaIcone[idTela];
    if (iconeAtivoId) {
        const iconeAtivo = document.getElementById(iconeAtivoId);
        if (iconeAtivo) {
            iconeAtivo.classList.add("ativo-icone");
        }
    }
}

function voltarAoMenu() {
    mostrarTela("tela-menu");
}

function voltarAoLogin() {
    mostrarTela("tela-login");
}

function mostrarTelaCadastroUsuario() {
    mostrarTela("tela-cadastro-usuarios");
}

function mostrarTelaCadastroReserva() {
    mostrarTela("tela-cadastro-reserva");
}

function mostrarTelaListarReservas() {
    mostrarTelaListarReservasLogic(); 
}

function mostrarTelaCalendario() {
    mostrarTela("tela-calendario");
}

function mostrarTelaConfiguracoes() {
    mostrarTela("tela-configuracoes");

    const perfilNome = document.getElementById("perfil-nome");
    const perfilUsuario = document.getElementById("perfil-usuario");
    const perfilAvatar = document.getElementById("user-avatar");

    if (typeof usuarioLogado !== 'undefined' && usuarioLogado) {
        if (perfilNome && perfilUsuario && perfilAvatar) {
            perfilNome.innerText = usuarioLogado.nome;
            perfilUsuario.innerText = `@${usuarioLogado.usuario}`;

            perfilAvatar.className = "";
            if(usuarioLogado.avatarIcon) {
                 perfilAvatar.classList.add(...usuarioLogado.avatarIcon.split(' '));
            } else {
                 perfilAvatar.classList.add("fas", "fa-user-circle");
            }
        }
    } else {
        if (perfilNome && perfilUsuario && perfilAvatar) {
            perfilNome.innerText = "Não logado";
            perfilUsuario.innerText = "";
            perfilAvatar.classList.add("fa", "fa-user-slash");
        }
    }
}


async function renderizarCalendario(mes, ano) {
    const nomesMes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const diasContainer = document.getElementById('calendario-dias');
    const mesAtualElement = document.getElementById('mes-atual');

    const { data: reservas, error } = await supabase
        .from('reservas')
        .select("*");

    diasContainer.innerHTML = '';
    mesAtualElement.innerHTML = `${nomesMes[mes]}, ${ano}`;

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaSemana; i++) {
        const diaLivre = document.createElement('span');
        diaLivre.classList.add('dia-livre');
        diasContainer.appendChild(diaLivre);
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const diaElemento = document.createElement('span');
        diaElemento.classList.add('dia');
        diaElemento.innerText = dia;
        diasContainer.appendChild(diaElemento);

        const hoje = new Date();
        if (dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
            diaElemento.classList.add('hoje');
        }

        const dataDia = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        
        if(reservas) {
            reservas.forEach(reserva => {
                const dataEntrada = new Date(reserva.data_entrada + 'T00:00:00');
                const dataSaida = new Date(reserva.data_saida + 'T00:00:00');
                const dataAtual = new Date(dataDia + 'T00:00:00');

                if (dataAtual >= dataEntrada && dataAtual <= dataSaida) {
                    diaElemento.classList.add('reservado');
                }
            });
        }

        const ehPublico = (typeof MODO_PUBLICO !== 'undefined' && MODO_PUBLICO === true);

        if (!ehPublico) {
            diaElemento.style.cursor = 'pointer';
            diaElemento.addEventListener('click', () => {
                const mesFormatado = String(mes + 1).padStart(2, '0');
                const diaFormatado = String(dia).padStart(2, '0');
                const dataSelecionada = `${ano}-${mesFormatado}-${diaFormatado}`;
                if(typeof checarReserva === 'function') {
                    checarReserva(dataSelecionada);
                }
            });
        } else {
            diaElemento.style.cursor = 'default';
            diaElemento.classList.add('dia-publico');
        }
    }
}

function aplicarTemaEscuro(isDark) {
    const body = document.body;
    if (isDark) {
        body.classList.add("dark-mode");
    } else {
        body.classList.remove("dark-mode");
    }
}

function iniciarTemaAutomatico() {
    const sistemaPrefereEscuro = window.matchMedia('(prefers-color-scheme: dark)');
    aplicarTemaEscuro(sistemaPrefereEscuro.matches);

    sistemaPrefereEscuro.addEventListener('change', (e) => {
        aplicarTemaEscuro(e.matches);
    });
}


let dataAtual = new Date();
let mesAtual = dataAtual.getMonth();
let anoAtual = dataAtual.getFullYear();

// Variáveis para o Financeiro
let mesFinanceiro = dataAtual.getMonth();
let anoFinanceiro = dataAtual.getFullYear();

async function mostrarTelaFinancas() {
    // CORREÇÃO: ID correto conforme HTML
    mostrarTela("tela-financas"); 
    await carregarDadosFinanceiros();
}

function mudarMesFinanceiro(delta) {
    mesFinanceiro += delta;
    if (mesFinanceiro > 11) {
        mesFinanceiro = 0;
        anoFinanceiro++;
    } else if (mesFinanceiro < 0) {
        mesFinanceiro = 11;
        anoFinanceiro--;
    }
    carregarDadosFinanceiros();
}

async function carregarDadosFinanceiros() {
    const nomesMes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    const tituloMesEl = document.getElementById('mes-financas-titulo');
    if(tituloMesEl) {
        tituloMesEl.innerText = `${nomesMes[mesFinanceiro]}, ${anoFinanceiro}`;
    }

    const dataInicio = `${anoFinanceiro}-${String(mesFinanceiro + 1).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anoFinanceiro, mesFinanceiro + 1, 0).getDate();
    const dataFim = `${anoFinanceiro}-${String(mesFinanceiro + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

    const { data: reservas, error } = await supabase
        .from('reservas')
        .select("*")
        .gte('data_entrada', dataInicio)
        .lte('data_entrada', dataFim); 
    if (error) {
        console.error("Erro ao carregar dados financeiros:", error);
        return;
    }

    const listaElemento = document.getElementById('lista-financas');
    const totalReceitasElemento = document.getElementById('valor-total-mes');
    
    if (listaElemento) listaElemento.innerHTML = '';

    let totalReceitas = 0;

    if (reservas.length === 0) {
        if(listaElemento) listaElemento.innerHTML = '<li style="padding:15px; text-align:center; color:#888;">Nenhuma receita neste mês.</li>';
        if(totalReceitasElemento) totalReceitasElemento.innerText = "R$ 0,00";
        return;
    }

    reservas.forEach(reserva => {
        const entrada = new Date(reserva.data_entrada);
        const saida = new Date(reserva.data_saida);
        const diffTime = Math.abs(saida - entrada);
        let dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dias === 0) dias = 1;

        const valorTotalReserva = parseFloat(reserva.diaria);
        totalReceitas += valorTotalReserva;

        const itemLista = document.createElement('li');
        itemLista.className = 'item-financa';

        const diaEntrada = String(entrada.getDate()).padStart(2, '0');

        itemLista.innerHTML = `
            <div class="financa-info">
                <strong>${reserva.nome_cliente}</strong>
            </div>
            <div class="financa-valor">
                + R$ ${valorTotalReserva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
        `;
        if(listaElemento) listaElemento.appendChild(itemLista);
    });
    
    if(totalReceitasElemento) totalReceitasElemento.innerText = `R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}