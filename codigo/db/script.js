document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000/api/produtos'; // URL da sua API backend

    const formProduto = document.getElementById('form-produto');
    const produtoIdInput = document.getElementById('produto-id');
    const nomeInput = document.getElementById('nome');
    const precoInput = document.getElementById('preco');
    const descricaoInput = document.getElementById('descricao');
    const tabelaProdutosBody = document.querySelector('#tabela-produtos tbody');
    const btnCancelar = document.getElementById('btn-cancelar');

    let editando = false;

    // Função para buscar e renderizar produtos
    async function carregarProdutos() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const produtos = await response.json();

            tabelaProdutosBody.innerHTML = ''; // Limpa a tabela antes de adicionar novos dados
            produtos.forEach(produto => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${produto.id}</td>
                    <td>${produto.nome}</td>
                    <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                    <td>${produto.descricao || '-'}</td>
                    <td>
                        <button class="btn-acao btn-editar" data-id="${produto.id}">Editar</button>
                        <button class="btn-acao btn-excluir" data-id="${produto.id}">Excluir</button>
                    </td>
                `;
                tabelaProdutosBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Falha ao carregar produtos:', error);
            alert('Não foi possível carregar os produtos. Verifique o console para mais detalhes.');
        }
    }

    // Função para limpar o formulário e resetar o estado de edição
    function limparFormulario() {
        formProduto.reset();
        produtoIdInput.value = '';
        editando = false;
        btnCancelar.style.display = 'none';
        document.getElementById('btn-salvar').textContent = 'Salvar Produto';
        nomeInput.focus();
    }

    // Função para preencher o formulário para edição
    async function preencherFormularioParaEdicao(id) {
        try {
            const response = await fetch(`${apiUrl}/${id}`);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            const produto = await response.json();

            produtoIdInput.value = produto.id;
            nomeInput.value = produto.nome;
            precoInput.value = produto.preco;
            descricaoInput.value = produto.descricao;

            editando = true;
            btnCancelar.style.display = 'inline-block';
            document.getElementById('btn-salvar').textContent = 'Atualizar Produto';
            nomeInput.focus();
            window.scrollTo(0, 0); // Rola para o topo para ver o formulário
        } catch (error) {
            console.error('Falha ao carregar produto para edição:', error);
            alert('Não foi possível carregar o produto para edição.');
        }
    }

    // Event listener para o formulário (Adicionar ou Atualizar)
    formProduto.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = produtoIdInput.value;
        const nome = nomeInput.value.trim();
        const preco = parseFloat(precoInput.value);
        const descricao = descricaoInput.value.trim();

        if (!nome || isNaN(preco) || preco < 0) {
            alert('Por favor, preencha o nome e um preço válido.');
            return;
        }

        const produtoData = { nome, preco, descricao };
        let metodo = 'POST';
        let url = apiUrl;

        if (editando && id) {
            metodo = 'PUT';
            url = `${apiUrl}/${id}`;
        }

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(produtoData),
            });

            if (!response.ok) {
                const erroData = await response.json();
                throw new Error(erroData.mensagem || `Erro HTTP: ${response.status}`);
            }

            await carregarProdutos(); // Recarrega a lista
            limparFormulario();
            alert(`Produto ${editando ? 'atualizado' : 'adicionado'} com sucesso!`);

        } catch (error) {
            console.error(`Falha ao ${editando ? 'atualizar' : 'adicionar'} produto:`, error);
            alert(`Não foi possível ${editando ? 'atualizar' : 'adicionar'} o produto. ${error.message}`);
        }
    });

    // Event listener para botões de Ação (Editar/Excluir) na tabela
    tabelaProdutosBody.addEventListener('click', async (event) => {
        const target = event.target;
        const id = target.dataset.id;

        if (!id) return; // Clicou em algo que não é um botão com data-id

        if (target.classList.contains('btn-editar')) {
            preencherFormularioParaEdicao(id);
        } else if (target.classList.contains('btn-excluir')) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                try {
                    const response = await fetch(`${apiUrl}/${id}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) {
                        const erroData = await response.json();
                        throw new Error(erroData.mensagem || `Erro HTTP: ${response.status}`);
                    }
                    await carregarProdutos(); // Recarrega a lista
                    alert('Produto excluído com sucesso!');
                } catch (error) {
                    console.error('Falha ao excluir produto:', error);
                    alert(`Não foi possível excluir o produto. ${error.message}`);
                }
            }
        }
    });

    // Event listener para o botão Cancelar Edição
    btnCancelar.addEventListener('click', () => {
        limparFormulario();
    });

    // Carregar produtos ao iniciar
    carregarProdutos();
});
