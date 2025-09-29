let usuarioLogado = null;

async function login(event) {
    if (event) {
        event.preventDefault();
    }

    const usuario = document.getElementById("usuario-login").value;
    const senha = document.getElementById("senha-login").value;

    try {
        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('usuario', usuario)
            .single();

            if (error || !usuarios) {
                alert("Usuário ou senha inválidos.");
                return;
            }

            const encoder = new TextEncoder();
            const data = encoder.encode(senha);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const senhaHash = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            if (usuarios.senha === senhaHash) {
                usuarioLogado = usuarios;
     
                alert(`Bem-vindo, ${usuarios.nome}!`);                
                
                if (usuarioLogado.is_admin) {
                    document.getElementById("btn-cadastro-usuario").style.display = "block";
                } else {
                    document.getElementById("btn-cadastro-usuario").style.display = "none";
                }

                 mostrarTela("tela-menu");
                mostrarTela("tela-calendario");

            } else {
                alert("Usuário ou senha inválidos.");
            }
            
    } catch (err) {
        alert("Ocorreu um erro ao fazer login!");
        console.error(err);
    }
    
}

async function cadastrarUsuario(event) {
    if (event) {
        event.preventDefault();
    }
    
    
    const nomeusuario = document.getElementById("nomeusuario").value;
    const usuario = document.getElementById("usuario-cadastro").value;
    const senha = document.getElementById("senha-cadastro").value;

    if (!nomeusuario || !usuario || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(senha);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const senhaHash = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        console.log("Senha hash:", senhaHash);

        const { data: novoUsuario, error } = await supabase
            .from('usuarios')
            .insert([{nome: nomeusuario, usuario: usuario, senha: senhaHash }]);

            if (error) {
                alert("Erro ao cadastrar usuário: " + error.message);
            } else {
                alert(`Usuário ${usuario} cadastrado com sucesso!`);
                document.getElementById("form-usuario").reset();
                //voltarAoMenu();
            }
    } catch (err) {
        alert("Erro ao cadastrar usuário!");
        console.error(err);

    mostrarTela("tela-login");
    }
}