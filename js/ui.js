function mostrarTela(idTela) {
    const telas = ["tela-login", "tela-menu", "tela-cadastro-reserva", "tela-cadastro-usuarios", "tela-listar-reservas", "tela-calendario", "tela-detalhes-reserva", "tela-configuracoes"];
    const rodape = document.getElementById("rodape");

    const telaParaIcone = {
        "tela-menu": "icone-menu",
        "tela-calendario": "icone-calendario",
        "tela-configuracoes": "icone-configuracoes",

        "tela-cadastro-reserva": "icone-calendario",
        "tela-listar-reservas": "icone-calendario",
        "tela-detalhes-reserva": "icone-calendario",
        "tela-cadastro-usuarios": "icone-menu"
    };

    telas.forEach(tela => {
        const el = document.getElementById(tela);
        if (el) el.style.display = 'none';
    });
    const telaAtiva = document.getElementById(idTela);
    if (telaAtiva) telaAtiva.style.display = 'block';

    if (idTela === "tela-login" && rodape) {
        rodape.style.display = 'none';
    } else if (rodape) {
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

function mostrarTelaCalendario() {
    mostrarTela("tela-calendario");
}

function mostrarTelaConfiguracoes() {
    mostrarTela("tela-configuracoes");

    const perfilNome = document.getElementById("perfil-nome");
    const perfilUsuario = document.getElementById("perfil-usuario");
    const perfilAvatar = document.getElementById("user-avatar");

    if (usuarioLogado) {
        if (perfilNome && perfilUsuario && perfilAvatar) {
            perfilNome.innerText = usuarioLogado.nome;
            perfilUsuario.innerText = `@${usuarioLogado.usuario}`;

            perfilAvatar.className = "";
            perfilAvatar.classList.add(...usuarioLogado.avatarIcon.split(' '));
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

    for(let dia = 1; dia <= diasNoMes; dia++) {
        const diaElemento = document.createElement('span');
        diaElemento.classList.add('dia');
        diaElemento.innerText = dia;
        diasContainer.appendChild(diaElemento);
          
       const hoje = new Date();
       if(dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
           diaElemento.classList.add('hoje');
       }

       const dataDia = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
       reservas.forEach(reserva => {
            const dataEntrada = new Date(reserva.data_entrada + 'T00:00:00');
            const dataSaida = new Date(reserva.data_saida + 'T00:00:00');
            const dataAtual = new Date(dataDia + 'T00:00:00');

            if (dataAtual >= dataEntrada && dataAtual <= dataSaida) {
                diaElemento.classList.add('reservado');
            }
       });

       diaElemento.addEventListener('click', () => {
        const mesFormatado = String(mes + 1).padStart(2, '0');
        const diaFormatado = String(dia).padStart(2, '0');
        const dataSelecionada = `${ano}-${mesFormatado}-${diaFormatado}`;
        checarReserva(dataSelecionada);
       });
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
