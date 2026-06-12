/**
 * GitHub Integration Script - PortfolioHUB
 * 
 * Este script integra a API pública do GitHub para buscar e exibir
 * repositórios dinamicamente no portfólio.
 * 
 * Autor: Geovanna (com suporte de Manus AI)
 * Data: Junho 2026
 */

// Configuração da API do GitHub
const GITHUB_USERNAME = 'nanaassss';
const GITHUB_API_URL = 'https://api.github.com/users';

/**
 * Busca repositórios do usuário via API do GitHub
 * @param {string} username - Nome de usuário do GitHub
 * @returns {Promise<Array>} - Array com os repositórios
 */
async function fetchGitHubRepositories(username) {
    try {
        const response = await fetch(`${GITHUB_API_URL}/${username}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error(`Erro na API do GitHub: ${response.status}`);
        }
        
        const repos = await response.json();
        return repos;
    } catch (error) {
        console.error('Erro ao buscar repositórios do GitHub:', error);
        return [];
    }
}

/**
 * Filtra repositórios por tópicos ou padrões de nome
 * @param {Array} repos - Array de repositórios
 * @param {string} filter - Filtro a aplicar ('academico', 'pessoal', ou 'todos')
 * @returns {Array} - Repositórios filtrados
 */
function filterRepositories(repos, filter = 'todos') {
    if (filter === 'todos') return repos;
    
    // Filtra por padrões de nome ou tópicos
    return repos.filter(repo => {
        const name = repo.name.toLowerCase();
        const topics = repo.topics ? repo.topics.map(t => t.toLowerCase()) : [];
        
        if (filter === 'academico') {
            return name.includes('academico') || 
                   name.includes('academic') || 
                   topics.includes('academico') ||
                   topics.includes('academic');
        } else if (filter === 'pessoal') {
            return !name.includes('academico') && 
                   !name.includes('academic') &&
                   !topics.includes('academico') &&
                   !topics.includes('academic');
        }
        
        return true;
    });
}

/**
 * Cria um card HTML para um repositório
 * @param {Object} repo - Objeto do repositório
 * @returns {string} - HTML do card
 */
function createRepositoryCard(repo) {
    const stars = repo.stargazers_count || 0;
    const language = repo.language || 'Não especificada';
    const description = repo.description || 'Sem descrição';
    const updatedDate = new Date(repo.updated_at).toLocaleDateString('pt-BR');
    
    return `
        <div class="repo-card">
            <div class="repo-header">
                <h4>
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                        ${repo.name}
                    </a>
                </h4>
                <span class="repo-visibility ${repo.private ? 'private' : 'public'}">
                    ${repo.private ? '🔒 Privado' : '🌐 Público'}
                </span>
            </div>
            <p class="repo-description">${description}</p>
            <div class="repo-meta">
                <span class="repo-language">
                    <span class="language-dot"></span>${language}
                </span>
                <span class="repo-stars">⭐ ${stars}</span>
                <span class="repo-updated">Atualizado: ${updatedDate}</span>
            </div>
            <div class="repo-topics">
                ${repo.topics && repo.topics.length > 0 
                    ? repo.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')
                    : '<span class="topic-tag">sem-tags</span>'
                }
            </div>
        </div>
    `;
}

/**
 * Renderiza repositórios em um container específico
 * @param {Array} repos - Array de repositórios
 * @param {string} containerId - ID do container
 */
function renderRepositories(repos, containerId) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Container com ID "${containerId}" não encontrado`);
        return;
    }
    
    if (repos.length === 0) {
        container.innerHTML = '<p class="no-repos">Nenhum repositório encontrado.</p>';
        return;
    }
    
    const html = repos
        .map(repo => createRepositoryCard(repo))
        .join('');
    
    container.innerHTML = html;
}

/**
 * Inicializa a integração do GitHub
 * Busca repositórios e os exibe nas seções apropriadas
 */
async function initGitHubIntegration() {
    console.log('Iniciando integração com GitHub...');
    
    // Busca todos os repositórios
    const allRepos = await fetchGitHubRepositories(GITHUB_USERNAME);
    
    if (allRepos.length === 0) {
        console.warn('Nenhum repositório encontrado ou erro na API');
        return;
    }
    
    // Filtra e renderiza repositórios acadêmicos
    const academicRepos = filterRepositories(allRepos, 'academico');
    if (document.getElementById('github-academicos')) {
        renderRepositories(academicRepos, 'github-academicos');
    }
    
    // Filtra e renderiza repositórios pessoais
    const personalRepos = filterRepositories(allRepos, 'pessoal');
    if (document.getElementById('github-pessoais')) {
        renderRepositories(personalRepos, 'github-pessoais');
    }
    
    console.log(`✓ Integração concluída: ${academicRepos.length} acadêmicos, ${personalRepos.length} pessoais`);
}

/**
 * Executa a inicialização quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    initGitHubIntegration();
});
