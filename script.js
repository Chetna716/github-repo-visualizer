document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const usernameInput = document.getElementById('username');
    const errorMessage = document.getElementById('errorMessage');
    const repoCount = document.getElementById('repoCount');
    const commitCount = document.getElementById('commitCount');
    const languagesList = document.getElementById('languagesList');

    searchBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (!username) {
            showError('Please enter a GitHub username');
            return;
        }
        fetchUserData(username);
    });

    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    async function fetchUserData(username) {
        try {
            // Reset error message
            hideError();
            
            // Fetch user's public repositories
            const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
            if (!reposResponse.ok) {
                throw new Error('User not found');
            }
            const repos = await reposResponse.json();

            // Update repository count
            repoCount.textContent = repos.length;

            // Fetch languages and commits for each repository
            let totalCommits = 0;
            const languages = new Set();

            for (const repo of repos) {
                // Fetch languages
                const languagesResponse = await fetch(repo.languages_url);
                const repoLanguages = await languagesResponse.json();
                Object.keys(repoLanguages).forEach(lang => languages.add(lang));

                // Fetch commits
                const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits`);
                const commits = await commitsResponse.json();
                totalCommits += commits.length;
            }

            // Update commit count
            commitCount.textContent = totalCommits;

            // Update languages list
            languagesList.innerHTML = Array.from(languages)
                .map(lang => `<span class="language-tag">${lang}</span>`)
                .join('');

        } catch (error) {
            showError(error.message);
            resetStats();
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function resetStats() {
        repoCount.textContent = '-';
        commitCount.textContent = '-';
        languagesList.textContent = '-';
    }
}); 