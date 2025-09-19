const API_BASE_URL = 'http://localhost:3000';

const cadastroForm = document.getElementById('cadastro-form');
const nomeInput = document.getElementById('nome');
const cpfInput = document.getElementById('cpf');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const searchTypeRadios = document.querySelectorAll('input[name="search-type"]');
const cadastroFeedback = document.getElementById('cadastro-feedback');

function mostrarMensagemCadastro(mensagem, tipo = 'erro') {
    cadastroFeedback.innerHTML = '';

    const p = document.createElement('p');
    p.textContent = mensagem;

    if (tipo === 'sucesso') {
        p.className = 'no-results sucess';
    } else {
        p.className = 'no-results error';
    }

    cadastroFeedback.appendChild(p);

    setTimeout(() => {
        p.remove();
    }, 5000);
}

function formatarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
}

function validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.length === 11;
}

function mostrarLoading(container, mensagem = 'Carregando...') {
    container.innerHTML = `
        <div class="loading">
            <p>${mensagem}</p>
        </div>
    `;
}

async function cadastrarPessoa(nome, cpf) {
    try {
        mostrarLoading(resultsContainer, 'Cadastrando usuário...');

        const response = await fetch(`${API_BASE_URL}/person`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: nome,
                cpf: cpf.replace(/\D/g, '')
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Erro ao cadastrar pessoa:', error);
        return { success: false, error: error.message };
    }
}

async function pesquisarPorNome(nome) {
    try {
        const response = await fetch(`${API_BASE_URL}/person?name=${encodeURIComponent(nome)}`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data: Array.isArray(data) ? data : [data] };
    } catch (error) {
        console.error('Erro ao pesquisar por nome:', error);
        return { success: false, error: error.message };
    }
}

async function pesquisarPorCPF(cpf) {
    try {
        const cpfLimpo = cpf.replace(/\D/g, '');
        const response = await fetch(`${API_BASE_URL}/person/${cpfLimpo}`);
        if (!response.ok) {
            if (response.status === 404) {
                return { success: true, data: [] };
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data: Array.isArray(data) ? data : [data] };
    } catch (error) {
        console.error('Erro ao pesquisar por CPF:', error);
        return { success: false, error: error.message };
    }
}

cpfInput.addEventListener('input', function (e) {
    e.target.value = formatarCPF(e.target.value);
});

cadastroForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nome = nomeInput.value.trim();
    const cpf = cpfInput.value.trim();

    if (!nome) {
        mostrarMensagemCadastro('Por favor, digite o nome.', 'erro');
        nomeInput.focus();
        return;
    }

    if (!validarCPF(cpf)) {
        mostrarMensagemCadastro('Por favor, digite um CPF válido (11 dígitos).', 'erro');
        cpfInput.focus();
        return;
    }

    const submitBtn = cadastroForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cadastrando...';

    try {
        const resultado = await cadastrarPessoa(nome, cpf);

        if (resultado.success) {
            cadastroForm.reset();
            mostrarMensagemCadastro('Usuário cadastrado com sucesso!', 'sucesso');

            if (searchInput.value.trim()) {
                realizarPesquisa();
            } else {
                exibirMensagemVazia();
            }
        } else {
            mostrarMensagemCadastro(`Erro ao cadastrar usuário: ${resultado.error}`, 'erro');
        }
    } catch (error) {
        mostrarMensagemCadastro(`Erro inesperado: ${error.message}`, 'erro');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

function getTipoPesquisa() {
    const radioSelecionado = document.querySelector('input[name="search-type"]:checked');
    return radioSelecionado ? radioSelecionado.value : 'nome';
}

async function realizarPesquisa() {
    const termo = searchInput.value.trim();
    const tipoPesquisa = getTipoPesquisa();

    if (!termo) {
        exibirMensagemVazia();
        return;
    }

    if (termo.length < 2) {
        resultsContainer.innerHTML = `
            <p class="no-results">
                Digite pelo menos 2 caracteres para pesquisar.
            </p>
        `;
        return;
    }

    mostrarLoading(resultsContainer, 'Pesquisando...');

    try {
        let resultado;

        if (tipoPesquisa === 'nome') {
            resultado = await pesquisarPorNome(termo);
        } else if (tipoPesquisa === 'cpf') {
            resultado = await pesquisarPorCPF(termo);
        }

        if (resultado.success) {
            exibirResultados(resultado.data, termo, tipoPesquisa);
        } else {
            resultsContainer.innerHTML = `
                <p class="no-results error">
                    Nenhum usuário encontrado para "${termo}" na pesquisa por ${tipoPesquisa}.
                </p>
            `;
        }
    } catch (error) {
        resultsContainer.innerHTML = `
            <p class="no-results error">
                Erro inesperado: ${error.message}
            </p>
        `;
    }
}

function exibirResultados(resultados, termo, tipoPesquisa) {
    if (!resultados || resultados.length === 0) {
        resultsContainer.innerHTML = `
            <p class="no-results error">
                Nenhum usuário encontrado para "${termo}" na pesquisa por ${tipoPesquisa}.
            </p>
        `;
        return;
    }

    let html = '';
    resultados.forEach(usuario => {
        const nome = usuario.name || usuario.nome;
        const cpf = usuario.cpf;
        const cpfFormatado = formatarCPF(cpf);

        html += `
            <div class="user-card">
                <h4>${nome}</h4>
                <p>CPF: ${cpfFormatado}</p>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;
}

function exibirMensagemVazia() {
    resultsContainer.innerHTML = `
        <p class="no-results">
            Nenhum resultado encontrado. Use a barra de pesquisa acima.
        </p>
    `;
}

searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        realizarPesquisa();
    }
});

searchTypeRadios.forEach(radio => {
    radio.addEventListener('change', function () {
        if (searchInput.value.trim()) {
            realizarPesquisa();
        }
    });
});

let searchTimeout;
searchInput.addEventListener('input', function () {
    const termo = this.value.trim();

    clearTimeout(searchTimeout);

    if (termo.length === 0) {
        exibirMensagemVazia();
        return;
    }

    if (termo.length >= 2) {
        searchTimeout = setTimeout(() => {
            realizarPesquisa();
        }, 500);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    exibirMensagemVazia();
    nomeInput.focus();

    fetch(`${API_BASE_URL}/person?name=teste`)
        .then(response => {
            if (!response.ok && response.status !== 404) {
                console.warn('API pode não estar disponível. Verifique se o servidor está rodando em http://localhost:3000');
            }
        })
        .catch(error => {
            console.warn('Não foi possível conectar com a API:', error.message);
            console.warn('Certifique-se de que o servidor está rodando em http://localhost:3000');
        });
});
