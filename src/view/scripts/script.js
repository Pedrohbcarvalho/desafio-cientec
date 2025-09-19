const API_BASE_URL = 'http://localhost:3000';

const registerForm = document.getElementById('cadastro-form');
const nameInput = document.getElementById('nome');
const cpfInput = document.getElementById('cpf');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const searchTypeRadios = document.querySelectorAll('input[name="search-type"]');
const registerFeedback = document.getElementById('cadastro-feedback');

function showRegisterMessage(message, type = 'erro') {
    registerFeedback.innerHTML = '';

    const p = document.createElement('p');
    p.textContent = message;

    if (type === 'sucesso') {
        p.className = 'no-results sucess';
    } else {
        p.className = 'no-results error';
    }

    registerFeedback.appendChild(p);

    setTimeout(() => {
        p.remove();
    }, 5000);
}

function formatCpf(cpf) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
}

function validateCpf(cpf) {
    const cpfAux = cpf.replace(/\D/g, '');
    return cpfAux.length === 11;
}

function showLoading(container, message = 'Carregando...') {
    container.innerHTML = `
        <div class="loading">
            <p>${message}</p>
        </div>
    `;
}

async function registerPerson(name, cpf) {
    try {
        showLoading(resultsContainer, 'Cadastrando usuário...');

        const response = await fetch(`${API_BASE_URL}/person`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
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

async function searchByName(name) {
    try {
        const response = await fetch(`${API_BASE_URL}/person?name=${encodeURIComponent(name)}`);
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

async function searchByCpf(cpf) {
    try {
        const cpfAux = cpf.replace(/\D/g, '');
        const response = await fetch(`${API_BASE_URL}/person/${cpfAux}`);
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
    e.target.value = formatCpf(e.target.value);
});

registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const cpf = cpfInput.value.trim();

    const nameMsg = nameInput.value;
    const cpfMsg = cpfInput.value;

    if (!name) {
        showRegisterMessage('Por favor, digite o nome.', 'erro');
        nameInput.focus();
        return;
    }

    if (!validateCpf(cpf)) {
        showRegisterMessage('Por favor, digite um CPF válido (11 dígitos).', 'erro');
        cpfInput.focus();
        return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cadastrando...';

    try {
        const result = await registerPerson(name, cpf);

        if (result.success) {
            registerForm.reset();

            const message = `Usuário ${nameMsg} (CPF: ${formatCpf(cpfMsg)}) cadastrado com sucesso!`;
            showRegisterMessage(message, 'sucesso');

            if (searchInput.value.trim()) {
                makeSearch();
            } else {
                showEmptyMessage();
            }
        } else {
            showRegisterMessage(`Erro ao cadastrar usuário: ${result.error}`, 'erro');
        }
    } catch (error) {
        showRegisterMessage(`Erro inesperado: ${error.message}`, 'erro');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

function getSearchType() {
    const selectedRadio = document.querySelector('input[name="search-type"]:checked');
    return selectedRadio ? selectedRadio.value : 'nome';
}

async function makeSearch() {
    const search = searchInput.value.trim();
    const searchType = getSearchType();

    if (!search) {
        showEmptyMessage();
        return;
    }

    if (search.length < 2) {
        resultsContainer.innerHTML = `
            <p class="no-results">
                Digite pelo menos 2 caracteres para pesquisar.
            </p>
        `;
        return;
    }

    showLoading(resultsContainer, 'Pesquisando...');

    try {
        let result;

        if (searchType === 'nome') {
            result = await searchByName(search);
        } else if (searchType === 'cpf') {
            result = await searchByCpf(search);
        }

        if (result.success) {
            showResults(result.data, search, searchType);
        } else {
            resultsContainer.innerHTML = `
                <p class="no-results error">
                    Nenhum usuário encontrado para "${search}" na pesquisa por ${searchType}.
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

function showResults(results, search, searchType) {
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = `
            <p class="no-results error">
                Nenhum usuário encontrado para "${search}" na pesquisa por ${searchType}.
            </p>
        `;
        return;
    }

    let html = '';
    results.forEach(user => {
        const name = user.name;
        const cpf = user.cpf;
        const cpfFormatado = formatCpf(cpf);

        html += `
            <div class="user-card">
                <h4>${name}</h4>
                <p>CPF: ${cpfFormatado}</p>
            </div>
        `;
    });

    resultsContainer.innerHTML = html;
}

function showEmptyMessage() {
    resultsContainer.innerHTML = `
        <p class="no-results">
            Nenhum resultado encontrado. Use a barra de pesquisa acima.
        </p>
    `;
}

searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        makeSearch();
    }
});

searchTypeRadios.forEach(radio => {
    radio.addEventListener('change', function () {
        if (searchInput.value.trim()) {
            makeSearch();
        }
    });
});

let searchTimeout;
searchInput.addEventListener('input', function () {
    const search = this.value.trim();

    clearTimeout(searchTimeout);

    if (search.length === 0) {
        showEmptyMessage();
        return;
    }

    if (search.length >= 2) {
        searchTimeout = setTimeout(() => {
            makeSearch();
        }, 500);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    showEmptyMessage();
    nameInput.focus();

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
