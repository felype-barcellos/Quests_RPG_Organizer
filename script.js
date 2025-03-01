// Armazenamento local das quests
let quests = JSON.parse(localStorage.getItem('quests')) || [];

// Elementos do DOM
const questsList = document.getElementById('questsList');
const addQuestBtn = document.getElementById('addQuestBtn');
const questModal = document.getElementById('questModal');
const questForm = document.getElementById('questForm');
const statusFilter = document.getElementById('statusFilter');
const tagFilter = document.getElementById('tagFilter');
const sortField = document.getElementById('sortField');
const sortOrder = document.getElementById('sortOrder');

// Adiciona listeners de eventos
addQuestBtn.addEventListener('click', () => openModal());
questForm.addEventListener('submit', handleQuestSubmit);
statusFilter.addEventListener('change', renderQuests);
tagFilter.addEventListener('input', renderQuests);
sortField.addEventListener('change', renderQuests);
sortOrder.addEventListener('change', renderQuests);

// Função para abrir o modal (modo adicionar ou editar)
function openModal(questId = null) {
    const modalTitle = document.getElementById('modalTitle');
    const questTitleInput = document.getElementById('questTitle');
    const questDescriptionInput = document.getElementById('questDescription');
    const questStatusInput = document.getElementById('questStatus');
    const questTagsInput = document.getElementById('questTags');
    const questIdInput = document.getElementById('questId');

    if (questId) {
        // Modo edição
        const quest = quests.find(q => q.id === questId);
        modalTitle.textContent = 'Editar Quest';
        questTitleInput.value = quest.title;
        questDescriptionInput.value = quest.description;
        questStatusInput.value = quest.status;
        questTagsInput.value = quest.tags ? quest.tags.join(', ') : '';
        questIdInput.value = questId;
    } else {
        // Modo adicionar
        modalTitle.textContent = 'Nova Quest';
        questForm.reset();
        questIdInput.value = '';
    }

    questModal.style.display = 'block';
}

// Função para fechar o modal
function closeModal() {
    questModal.style.display = 'none';
}

// Função para processar as tags
function processTags(tagsString) {
    return tagsString
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
}

// Função para lidar com o envio do formulário
async function handleQuestSubmit(e) {
    e.preventDefault();

    try {
        const questId = document.getElementById('questId').value;
        const title = document.getElementById('questTitle').value;
        const description = document.getElementById('questDescription').value;
        const status = document.getElementById('questStatus').value;
        const tags = processTags(document.getElementById('questTags').value);
        const startDate = document.getElementById('questStartDate').value;
        const endDate = document.getElementById('questEndDate').value;

        if (questId) {
            // Atualiza quest existente
            const index = quests.findIndex(q => q.id === questId);
            if (index !== -1) {
                quests[index] = { ...quests[index], title, description, status, tags, startDate, endDate };
            }
        } else {
            // Cria nova quest
            const newQuest = {
                id: Date.now().toString(),
                title,
                description,
                status,
                tags,
                createdAt: new Date().toISOString(),
                startDate,
                endDate
            };
            quests.push(newQuest);
        }

        // Salva no localStorage e atualiza a interface
        await saveQuests();
        await renderQuests();
        closeModal();
    } catch (error) {
        console.error('Erro ao salvar quest:', error);
    }
}

// Função para excluir uma quest
function deleteQuest(questId) {
    if (confirm('Tem certeza que deseja excluir esta quest?')) {
        quests = quests.filter(quest => quest.id !== questId);
        saveQuests();
        renderQuests();
    }
}

// Função para salvar quests no localStorage
async function saveQuests() {
    try {
        localStorage.setItem('quests', JSON.stringify(quests));
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
    }
}

// Função para renderizar as tags de uma quest
function renderTags(tags) {
    if (!tags || tags.length === 0) return '';
    
    return `
        <div class="quest-tags">
            ${tags.map(tag => `
                <span class="quest-tag">${tag}</span>
            `).join('')}
        </div>
    `;
}

// Função para renderizar as quests na interface
async function renderQuests() {
    try {
        const selectedStatus = statusFilter.value;
        const searchTag = tagFilter.value.trim().toLowerCase();
        const field = sortField.value;
        const order = sortOrder.value;

        const filteredQuests = quests.filter(quest => {
            const statusMatch = selectedStatus === 'todos' || quest.status === selectedStatus;
            const tagMatch = !searchTag || (quest.tags && quest.tags.some(tag => tag.includes(searchTag)));
            return statusMatch && tagMatch;
        });

        // Ordena as quests
        filteredQuests.sort((a, b) => {
            let valueA, valueB;
            
            if (field === 'startDate') {
                valueA = a.startDate ? new Date(a.startDate).getTime() : 0;
                valueB = b.startDate ? new Date(b.startDate).getTime() : 0;
            } else {
                valueA = a.title.toLowerCase();
                valueB = b.title.toLowerCase();
            }
            
            if (order === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });

        questsList.innerHTML = filteredQuests
            .map(quest => `
                <div class="quest-card">
                    <h3>${quest.title}</h3>
                    <p>${quest.description}</p>
                    ${renderTags(quest.tags)}
                    <span class="quest-status status-${quest.status}">
                        ${quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
                    </span>
                    <div class="quest-dates">
                        ${quest.startDate ? `<p>Início: ${quest.startDate}</p>` : ''}
                        ${quest.endDate ? `<p>Fim: ${quest.endDate}</p>` : ''}
                    </div>
                    <div class="form-buttons">
                        <button class="action-btn" onclick="openModal('${quest.id}')">
                            ✏️ Editar
                        </button>
                        <button class="action-btn" onclick="deleteQuest('${quest.id}')">
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            `)
            .join('');
    } catch (error) {
        console.error('Erro ao renderizar quests:', error);
    }
}

// Renderiza as quests ao carregar a página
renderQuests();