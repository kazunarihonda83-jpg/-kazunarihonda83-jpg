const API_BASE = '';
let currentUser = null;
let qaData = null;

// DOM要素
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const clearButton = document.getElementById('clearButton');
const messages = document.getElementById('messages');
const loading = document.getElementById('loading');
const categoryList = document.getElementById('categoryList');
const historyList = document.getElementById('historyList');
const favoriteList = document.getElementById('favoriteList');
const quickQuestions = document.getElementById('quickQuestions');
const top10List = document.getElementById('top10List');
const tagCloud = document.getElementById('tagCloud');
const breadcrumb = document.getElementById('breadcrumb');
const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
const searchSuggestions = document.getElementById('searchSuggestions');

// 認証関連
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userInfo = document.getElementById('userInfo');

// ========== 認証関連 ==========

function showAuthModal() {
    authModal.classList.add('show');
    showLoginForm();
}

function hideAuthModal() {
    authModal.classList.remove('show');
    document.getElementById('authMessage').innerHTML = '';
    loginForm.reset();
    registerForm.reset();
}

function showLoginForm() {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    document.getElementById('modalTitle').textContent = 'ログイン';
}

function showRegisterForm() {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    document.getElementById('modalTitle').textContent = '新規登録';
}

function showMessage(message, type) {
    const msgDiv = document.getElementById('authMessage');
    msgDiv.className = type === 'error' ? 'error-message' : 'success-message';
    msgDiv.textContent = message;
}

async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/api/auth/check`);
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            updateUIForLoggedInUser();
        } else {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('認証チェックエラー:', error);
    }
}

function updateUIForLoggedInUser() {
    userInfo.innerHTML = `
        <span class="username-display">こんにちは、${currentUser.username}さん</span>
        <button class="logout-btn" id="logoutBtn">ログアウト</button>
    `;
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // お気に入りと履歴を読み込む
    loadHistory();
    loadFavorites();
}

function updateUIForLoggedOutUser() {
    userInfo.innerHTML = `
        <button class="login-btn" id="loginBtn">ログイン</button>
    `;
    
    document.getElementById('loginBtn').addEventListener('click', showAuthModal);
    
    // お気に入りと履歴をクリア
    historyList.innerHTML = '<div class="login-required-message">ログインすると履歴が保存されます</div>';
    favoriteList.innerHTML = '<div class="login-required-message">ログインするとお気に入りが保存できます</div>';
}

async function login(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('ログインしました', 'success');
            setTimeout(() => {
                hideAuthModal();
                checkAuth();
            }, 1000);
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('ログインに失敗しました', 'error');
    }
}

async function register(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('登録が完了しました。ログインしてください。', 'success');
            setTimeout(() => {
                showLoginForm();
            }, 1500);
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('登録に失敗しました', 'error');
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
        currentUser = null;
        updateUIForLoggedOutUser();
        clearMessages();
    } catch (error) {
        console.error('ログアウトエラー:', error);
    }
}

// ========== お気に入り関連 ==========

async function toggleFavorite(qaId, question) {
    if (!currentUser) {
        alert('お気に入りを使用するにはログインしてください');
        showAuthModal();
        return;
    }
    
    try {
        const checkResponse = await fetch(`${API_BASE}/api/favorites/check/${qaId}`);
        const checkData = await checkResponse.json();
        
        if (checkData.is_favorited) {
            // 削除
            const response = await fetch(`${API_BASE}/api/favorites/${qaId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadFavorites();
                updateFavoriteButton(qaId, false);
            }
        } else {
            // 追加
            const response = await fetch(`${API_BASE}/api/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qa_id: qaId, question })
            });
            
            if (response.ok) {
                loadFavorites();
                updateFavoriteButton(qaId, true);
            }
        }
    } catch (error) {
        if (error.message && error.message.includes('401')) {
            alert('セッションが切れました。再度ログインしてください');
            showAuthModal();
        } else {
            console.error('お気に入り操作エラー:', error);
        }
    }
}

function updateFavoriteButton(qaId, isFavorited) {
    const btn = document.querySelector(`[data-fav-id="${qaId}"]`);
    if (btn) {
        if (isFavorited) {
            btn.classList.add('favorited');
            btn.textContent = '★';
        } else {
            btn.classList.remove('favorited');
            btn.textContent = '☆';
        }
    }
}

async function loadFavorites() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/favorites`);
        const data = await response.json();
        
        if (response.ok && data.favorites.length > 0) {
            favoriteList.innerHTML = data.favorites.map(item => `
                <li class="favorite-item" onclick="searchFromHistory('${item.question.replace(/'/g, "\\'")}')">
                    ${item.question.substring(0, 30)}${item.question.length > 30 ? '...' : ''}
                </li>
            `).join('');
        } else {
            favoriteList.innerHTML = '<div class="no-data">お気に入りなし</div>';
        }
    } catch (error) {
        console.error('お気に入り読み込みエラー:', error);
    }
}

// ========== 検索履歴関連 ==========

async function loadHistory() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/history`);
        const data = await response.json();
        
        if (response.ok && data.history.length > 0) {
            historyList.innerHTML = data.history.map(item => `
                <li class="history-item" onclick="searchFromHistory('${item.replace(/'/g, "\\'")}')">
                    <span>${item}</span>
                    <span class="history-remove" onclick="event.stopPropagation(); removeFromHistory('${item.replace(/'/g, "\\'")}')">×</span>
                </li>
            `).join('');
        } else {
            historyList.innerHTML = '<div class="no-data">履歴なし</div>';
        }
    } catch (error) {
        console.error('履歴読み込みエラー:', error);
    }
}

async function removeFromHistory(query) {
    if (!currentUser) return;
    
    try {
        await fetch(`${API_BASE}/api/history`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        loadHistory();
    } catch (error) {
        console.error('履歴削除エラー:', error);
    }
}

function searchFromHistory(query) {
    searchInput.value = query;
    search();
}

// ========== 統計情報 ==========

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/api/stats`);
        const data = await response.json();
        document.getElementById('totalCategories').textContent = data.total_categories;
        document.getElementById('totalQuestions').textContent = data.total_questions;
    } catch (error) {
        console.error('統計情報の読み込みに失敗しました:', error);
    }
}

// ========== よくある質問TOP10 ==========

async function loadTop10() {
    try {
        const response = await fetch(`${API_BASE}/api/top10`);
        const data = await response.json();
        
        if (data.top10 && data.top10.length > 0) {
            top10List.innerHTML = data.top10.map(item => `
                <li class="top10-item" onclick="showTop10Detail('${item.id}', '${item.question.replace(/'/g, "\\'")}', '${item.category}')">
                    <div class="top10-rank">${item.rank}</div>
                    <div class="top10-question">${item.question}</div>
                </li>
            `).join('');
        } else {
            top10List.innerHTML = '<div class="no-data">データなし</div>';
        }
    } catch (error) {
        console.error('TOP10の読み込みに失敗しました:', error);
        top10List.innerHTML = '<div class="no-data">読み込みエラー</div>';
    }
}

async function showTop10Detail(qaId, question, category) {
    try {
        // パンくずリストを更新
        updateBreadcrumb('TOP10', question);
        
        messages.innerHTML = `
            <div class="message-group">
                <div class="user-message">
                    ${question}
                </div>
            </div>
        `;
        
        loading.classList.add('show');
        
        const response = await fetch(`${API_BASE}/api/qa/${qaId}`);
        const data = await response.json();
        
        loading.classList.remove('show');
        
        if (data.qa) {
            const qa = data.qa;
            const favorited = qa.is_favorited || false;
            const favClass = favorited ? 'favorited' : '';
            const favIcon = favorited ? '★' : '☆';
            const visualHtml = qa.visual_data ? renderVisualData(qa.visual_data) : '';
            
            let resultsHtml = '<div class="message-group"><div class="bot-message">';
            resultsHtml += `
                <div class="result-item">
                    <div class="result-header">
                        <span class="result-category">${category}</span>
                        <span class="score-badge">TOP10</span>
                        <div class="result-actions" style="margin-left: auto;">
                            <button class="action-btn ${favClass}" data-fav-id="${qa.id}" onclick="toggleFavorite('${qa.id}', '${qa.question.replace(/'/g, "\\'")}')">
                                ${favIcon}
                            </button>
                        </div>
                    </div>
                    <div class="result-question">${qa.question}</div>
                    <div class="result-answer">${qa.answer}</div>
                    ${visualHtml}
                </div>
            `;
            resultsHtml += '</div></div>';
            messages.innerHTML += resultsHtml;
        }
        
        messages.scrollTop = messages.scrollHeight;
    } catch (error) {
        loading.classList.remove('show');
        console.error('TOP10詳細の読み込みに失敗しました:', error);
    }
}

// ========== タグ機能 ==========

async function loadTags() {
    try {
        const response = await fetch(`${API_BASE}/api/tags`);
        const data = await response.json();
        
        if (data.tags && data.tags.length > 0) {
            tagCloud.innerHTML = data.tags.map(item => `
                <div class="tag-item" onclick="searchByTag('${item.tag}')">
                    ${item.tag} <span class="tag-count">(${item.count})</span>
                </div>
            `).join('');
        } else {
            tagCloud.innerHTML = '<div class="no-data">タグなし</div>';
        }
    } catch (error) {
        console.error('タグの読み込みに失敗しました:', error);
        tagCloud.innerHTML = '<div class="no-data">読み込みエラー</div>';
    }
}

async function searchByTag(tagName) {
    try {
        // パンくずリストを更新
        updateBreadcrumb('タグ検索', `#${tagName}`);
        
        messages.innerHTML = `
            <div class="message-group">
                <div class="user-message">
                    タグ「${tagName}」で検索
                </div>
            </div>
        `;
        
        loading.classList.add('show');
        
        const response = await fetch(`${API_BASE}/api/tag/${encodeURIComponent(tagName)}`);
        const data = await response.json();
        
        loading.classList.remove('show');
        
        if (data.results && data.results.length > 0) {
            let resultsHtml = '<div class="message-group"><div class="bot-message">';
            resultsHtml += `<p style="margin-bottom: 16px; font-weight: 500;"><strong>タグ「${tagName}」に関連する${data.results.length}件のQ&A</strong></p>`;
            
            data.results.forEach(result => {
                const favorited = result.is_favorited || false;
                const favClass = favorited ? 'favorited' : '';
                const favIcon = favorited ? '★' : '☆';
                const visualHtml = result.visual_data ? renderVisualData(result.visual_data) : '';
                
                resultsHtml += `
                    <div class="result-item">
                        <div class="result-header">
                            <span class="result-category">${result.category}</span>
                            <div class="result-actions" style="margin-left: auto;">
                                <button class="action-btn ${favClass}" data-fav-id="${result.id}" onclick="toggleFavorite('${result.id}', '${result.question.replace(/'/g, "\\'")}')">
                                    ${favIcon}
                                </button>
                            </div>
                        </div>
                        <div class="result-question">${result.question}</div>
                        <div class="result-answer">${result.answer}</div>
                        ${visualHtml}
                    </div>
                `;
            });
            
            resultsHtml += '</div></div>';
            messages.innerHTML += resultsHtml;
        } else {
            messages.innerHTML += `
                <div class="message-group">
                    <div class="bot-message" style="text-align: center; color: #6b7280;">
                        <p>このタグに関連するQ&Aが見つかりませんでした。</p>
                    </div>
                </div>
            `;
        }
        
        messages.scrollTop = messages.scrollHeight;
    } catch (error) {
        loading.classList.remove('show');
        console.error('タグ検索エラー:', error);
    }
}

// ========== 検索サジェスト ==========

let suggestionTimeout = null;

async function showSuggestions(query) {
    if (suggestionTimeout) {
        clearTimeout(suggestionTimeout);
    }
    
    if (!query || query.length < 2) {
        searchSuggestions.classList.remove('show');
        return;
    }
    
    suggestionTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/suggestions?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.suggestions && data.suggestions.length > 0) {
                searchSuggestions.innerHTML = data.suggestions.map(suggestion => `
                    <div class="suggestion-item" onclick="selectSuggestion('${suggestion.replace(/'/g, "\\'")}')">
                        ${suggestion}
                    </div>
                `).join('');
                searchSuggestions.classList.add('show');
            } else {
                searchSuggestions.classList.remove('show');
            }
        } catch (error) {
            console.error('サジェスト取得エラー:', error);
            searchSuggestions.classList.remove('show');
        }
    }, 300); // 300msのデバウンス
}

function selectSuggestion(suggestion) {
    searchInput.value = suggestion;
    searchSuggestions.classList.remove('show');
    search();
}

function hideSuggestions() {
    setTimeout(() => {
        searchSuggestions.classList.remove('show');
    }, 200);
}

// ========== パンくずリスト ==========

function updateBreadcrumb(section, title) {
    breadcrumbCurrent.textContent = `${section}: ${title}`;
    breadcrumb.style.display = 'block';
}

function clearBreadcrumb() {
    breadcrumb.style.display = 'none';
    breadcrumbCurrent.textContent = '';
}

// ========== カテゴリー ==========

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const data = await response.json();
        
        categoryList.innerHTML = '';
        data.categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';
            li.innerHTML = `
                <span>${category.name}</span>
                <span class="category-count">${category.count}</span>
            `;
            li.onclick = () => loadCategoryDetail(category.id, category.name);
            categoryList.appendChild(li);
        });
    } catch (error) {
        console.error('カテゴリーの読み込みに失敗しました:', error);
    }
}

async function loadCategoryDetail(categoryId, categoryName) {
    try {
        messages.innerHTML = `
            <div class="message-group">
                <div class="user-message">
                    「${categoryName}」のQ&Aを表示
                </div>
            </div>
        `;
        
        loading.classList.add('show');
        
        const response = await fetch(`${API_BASE}/api/category/${categoryId}`);
        const data = await response.json();
        
        loading.classList.remove('show');
        
        let resultsHtml = '<div class="message-group"><div class="bot-message">';
        resultsHtml += `<h3 style="margin-bottom: 16px; color: #111827; font-size: 1.1em;">${data.name}</h3>`;
        
        data.qas.forEach(qa => {
            const favorited = qa.is_favorited || false;
            const favClass = favorited ? 'favorited' : '';
            const favIcon = favorited ? '★' : '☆';
            const visualHtml = qa.visual_data ? renderVisualData(qa.visual_data) : '';
            
            resultsHtml += `
                <div class="result-item">
                    <div class="result-header">
                        <div class="result-actions">
                            <button class="action-btn ${favClass}" data-fav-id="${qa.id}" onclick="toggleFavorite('${qa.id}', '${qa.question.replace(/'/g, "\\'")}')">
                                ${favIcon}
                            </button>
                        </div>
                    </div>
                    <div class="result-question">${qa.question}</div>
                    <div class="result-answer">${qa.answer}</div>
                    ${visualHtml}
                </div>
            `;
        });
        
        resultsHtml += '</div></div>';
        messages.innerHTML += resultsHtml;
        messages.scrollTop = messages.scrollHeight;
    } catch (error) {
        loading.classList.remove('show');
        console.error('カテゴリー詳細の読み込みに失敗しました:', error);
    }
}

// ========== 検索 ==========

async function search() {
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('質問を入力してください');
        return;
    }
    
    // サジェストを非表示
    searchSuggestions.classList.remove('show');
    
    // パンくずリストを更新
    updateBreadcrumb('検索結果', query);

    messages.innerHTML = `
        <div class="message-group">
            <div class="user-message">
                ${query}
            </div>
        </div>
    `;

    loading.classList.add('show');

    try {
        const response = await fetch(`${API_BASE}/api/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });

        const data = await response.json();
        loading.classList.remove('show');

        if (data.results && data.results.length > 0) {
            // 検索結果のグループ化
            const groupedResults = groupSearchResults(data.results);
            
            let resultsHtml = '<div class="message-group"><div class="bot-message">';
            resultsHtml += `<p style="margin-bottom: 16px; font-weight: 500;"><strong>${data.results.length}件の関連するQ&Aが見つかりました</strong></p>`;
            
            // 最も関連度が高い回答（スコア80%以上）
            if (groupedResults.high.length > 0) {
                resultsHtml += '<div class="result-group">';
                resultsHtml += '<h3 class="result-group-title">🎯 最も関連度が高い回答</h3>';
                resultsHtml += renderResultItems(groupedResults.high);
                resultsHtml += '</div>';
            }
            
            // 関連する回答（スコア50-79%）
            if (groupedResults.medium.length > 0) {
                resultsHtml += '<div class="result-group">';
                resultsHtml += '<h3 class="result-group-title">📋 関連する回答</h3>';
                resultsHtml += renderResultItems(groupedResults.medium);
                resultsHtml += '</div>';
            }
            
            // 参考情報（スコア50%未満）
            if (groupedResults.low.length > 0) {
                resultsHtml += '<div class="result-group">';
                resultsHtml += '<h3 class="result-group-title">💡 参考情報</h3>';
                resultsHtml += renderResultItems(groupedResults.low);
                resultsHtml += '</div>';
            }
            
            resultsHtml += '</div></div>';
            messages.innerHTML += resultsHtml;
        } else {
            messages.innerHTML += `
                <div class="message-group">
                    <div class="bot-message" style="text-align: center; color: #6b7280;">
                        <p>申し訳ございません。該当するQ&Aが見つかりませんでした。</p>
                        <p>別の言葉で質問してみるか、左のカテゴリーから探してみてください。</p>
                    </div>
                </div>
            `;
        }

        messages.scrollTop = messages.scrollHeight;
        
        // ログインしている場合は履歴を更新
        if (currentUser) {
            loadHistory();
        }
    } catch (error) {
        loading.classList.remove('show');
        console.error('検索エラー:', error);
        messages.innerHTML += `
            <div class="message-group">
                <div class="bot-message">
                    <p>エラーが発生しました。もう一度お試しください。</p>
                </div>
            </div>
        `;
    }

    searchInput.value = '';
}

// ========== 検索結果のグループ化 ==========

function groupSearchResults(results) {
    const grouped = {
        high: [],    // 80%以上
        medium: [],  // 50-79%
        low: []      // 50%未満
    };
    
    results.forEach(result => {
        const scorePercent = Math.round(result.score * 100);
        if (scorePercent >= 80) {
            grouped.high.push(result);
        } else if (scorePercent >= 50) {
            grouped.medium.push(result);
        } else {
            grouped.low.push(result);
        }
    });
    
    return grouped;
}

function renderResultItems(results) {
    return results.map(result => {
        const scorePercent = Math.round(result.score * 100);
        const favorited = result.is_favorited || false;
        const favClass = favorited ? 'favorited' : '';
        const favIcon = favorited ? '★' : '☆';
        const visualHtml = result.visual_data ? renderVisualData(result.visual_data) : '';
        
        return `
            <div class="result-item">
                <div class="result-header">
                    <span class="result-category">${result.category}</span>
                    <span class="score-badge">関連度: ${scorePercent}%</span>
                    <div class="result-actions" style="margin-left: auto;">
                        <button class="action-btn ${favClass}" data-fav-id="${result.id}" onclick="toggleFavorite('${result.id}', '${result.question.replace(/'/g, "\\'")}')">
                            ${favIcon}
                        </button>
                    </div>
                </div>
                <div class="result-question">${result.question}</div>
                <div class="result-answer">${result.answer}</div>
                ${visualHtml}
            </div>
        `;
    }).join('');
}

function clearMessages() {
    clearBreadcrumb();
    messages.innerHTML = `
        <div class="welcome-message">
            <h2>業務改善助成金Q&A</h2>
            <p>業務改善助成金に関するご質問にお答えします</p>
            <p>検索ボックスに質問を入力するか、左のメニューからお選びください</p>
        </div>
    `;
}

// ========== イベントリスナー ==========

loginBtn.addEventListener('click', showAuthModal);
loginTab.addEventListener('click', showLoginForm);
registerTab.addEventListener('click', showRegisterForm);
loginForm.addEventListener('submit', login);
registerForm.addEventListener('submit', register);
document.getElementById('cancelLoginBtn').addEventListener('click', hideAuthModal);
document.getElementById('cancelRegisterBtn').addEventListener('click', hideAuthModal);

searchButton.addEventListener('click', search);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        search();
    }
});

// 検索サジェストのイベントリスナー
searchInput.addEventListener('input', (e) => {
    showSuggestions(e.target.value);
});

searchInput.addEventListener('blur', hideSuggestions);

searchInput.addEventListener('focus', (e) => {
    if (e.target.value.length >= 2) {
        showSuggestions(e.target.value);
    }
});

clearButton.addEventListener('click', clearMessages);

// モーダル外クリックで閉じる
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        hideAuthModal();
    }
});

// ========== 初期化 ==========

checkAuth();
loadStats();
loadCategories();
loadTop10();
loadTags();
