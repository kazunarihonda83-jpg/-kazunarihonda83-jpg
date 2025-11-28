from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import json
import re
from difflib import SequenceMatcher
import secrets
from functools import wraps
import database as db

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)
CORS(app)

# データベース初期化
db.init_db()

# Q&Aデータを読み込む
def load_qa_data():
    with open('data/qa_data.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_top10_data():
    with open('data/top10_questions.json', 'r', encoding='utf-8') as f:
        return json.load(f)

qa_data = load_qa_data()
top10_data = load_top10_data()

# ログイン必須デコレータ
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'ログインが必要です', 'require_login': True}), 401
        return f(*args, **kwargs)
    return decorated_function

def normalize_text(text):
    """テキストを正規化（空白削除、小文字化）"""
    text = text.lower()
    text = re.sub(r'\s+', '', text)
    return text

def calculate_similarity(text1, text2):
    """2つのテキストの類似度を計算"""
    return SequenceMatcher(None, normalize_text(text1), normalize_text(text2)).ratio()

def search_qa(query):
    """質問文から関連するQ&Aを検索"""
    results = []
    query_normalized = normalize_text(query)
    
    for category in qa_data['categories']:
        for qa in category['qas']:
            # 質問文との類似度
            question_similarity = calculate_similarity(query, qa['question'])
            
            # キーワードマッチング
            keyword_matches = sum(1 for keyword in qa['keywords'] 
                                if keyword.lower() in query.lower())
            keyword_score = keyword_matches / len(qa['keywords']) if qa['keywords'] else 0
            
            # 総合スコア（質問文類似度70%、キーワード30%）
            total_score = (question_similarity * 0.7) + (keyword_score * 0.3)
            
            if total_score > 0.1:  # 閾値
                results.append({
                    'category': category['name'],
                    'question': qa['question'],
                    'answer': qa['answer'],
                    'score': total_score,
                    'id': qa['id'],
                    'visual_data': qa.get('visual_data')
                })
    
    # スコアでソート
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:5]  # 上位5件を返す

def get_all_categories():
    """すべてのカテゴリー一覧を取得"""
    return [{'id': cat['id'], 'name': cat['name'], 'count': len(cat['qas'])} 
            for cat in qa_data['categories']]

def get_category_qas(category_id):
    """特定カテゴリーのQ&Aを取得"""
    for category in qa_data['categories']:
        if category['id'] == category_id:
            return {
                'name': category['name'],
                'qas': category['qas']
            }
    return None

# ========== 認証関連のルート ==========

@app.route('/api/auth/register', methods=['POST'])
def register():
    """ユーザー登録"""
    data = request.get_json()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not username or not email or not password:
        return jsonify({'error': '全ての項目を入力してください'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'パスワードは6文字以上にしてください'}), 400
    
    result = db.create_user(username, email, password)
    
    if result['success']:
        return jsonify({'message': '登録が完了しました'}), 201
    else:
        return jsonify({'error': result['error']}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    """ログイン"""
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'error': 'ユーザー名とパスワードを入力してください'}), 400
    
    result = db.verify_user(username, password)
    
    if result['success']:
        session['user_id'] = result['user']['id']
        session['username'] = result['user']['username']
        return jsonify({
            'message': 'ログインしました',
            'user': result['user']
        }), 200
    else:
        return jsonify({'error': result['error']}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """ログアウト"""
    session.clear()
    return jsonify({'message': 'ログアウトしました'}), 200

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    """認証状態チェック"""
    if 'user_id' in session:
        user = db.get_user_by_id(session['user_id'])
        if user:
            return jsonify({'authenticated': True, 'user': user}), 200
    return jsonify({'authenticated': False}), 200

# ========== お気に入り関連のルート ==========

@app.route('/api/favorites', methods=['GET'])
@login_required
def get_favorites():
    """お気に入り一覧取得"""
    user_id = session['user_id']
    favorites = db.get_user_favorites(user_id)
    return jsonify({'favorites': favorites}), 200

@app.route('/api/favorites', methods=['POST'])
@login_required
def add_favorite():
    """お気に入り追加"""
    data = request.get_json()
    qa_id = data.get('qa_id')
    question = data.get('question')
    
    if not qa_id or not question:
        return jsonify({'error': '不正なリクエストです'}), 400
    
    user_id = session['user_id']
    result = db.add_favorite(user_id, qa_id, question)
    
    if result['success']:
        return jsonify({'message': 'お気に入りに追加しました'}), 200
    else:
        return jsonify({'error': result['error']}), 400

@app.route('/api/favorites/<qa_id>', methods=['DELETE'])
@login_required
def delete_favorite(qa_id):
    """お気に入り削除"""
    user_id = session['user_id']
    result = db.remove_favorite(user_id, qa_id)
    
    if result['success']:
        return jsonify({'message': 'お気に入りから削除しました'}), 200
    else:
        return jsonify({'error': result['error']}), 400

@app.route('/api/favorites/check/<qa_id>', methods=['GET'])
@login_required
def check_favorite(qa_id):
    """お気に入り登録状態チェック"""
    user_id = session['user_id']
    is_fav = db.is_favorited(user_id, qa_id)
    return jsonify({'is_favorited': is_fav}), 200

# ========== 検索履歴関連のルート ==========

@app.route('/api/history', methods=['GET'])
@login_required
def get_history():
    """検索履歴取得"""
    user_id = session['user_id']
    history = db.get_user_search_history(user_id)
    return jsonify({'history': history}), 200

@app.route('/api/history', methods=['POST'])
@login_required
def add_history():
    """検索履歴追加"""
    data = request.get_json()
    query = data.get('query', '').strip()
    
    if not query:
        return jsonify({'error': '検索クエリが空です'}), 400
    
    user_id = session['user_id']
    db.add_search_history(user_id, query)
    return jsonify({'message': '履歴に追加しました'}), 200

@app.route('/api/history', methods=['DELETE'])
@login_required
def delete_history():
    """検索履歴削除"""
    data = request.get_json()
    query = data.get('query', '')
    
    user_id = session['user_id']
    result = db.delete_search_history_item(user_id, query)
    
    if result['success']:
        return jsonify({'message': '履歴から削除しました'}), 200
    else:
        return jsonify({'error': result['error']}), 400

# ========== Q&A関連のルート ==========

@app.route('/')
def index():
    """メインページ"""
    return render_template('index.html')

@app.route('/api/search', methods=['POST'])
def search():
    """Q&A検索API"""
    data = request.get_json()
    query = data.get('query', '')
    
    if not query:
        return jsonify({'error': '質問を入力してください'}), 400
    
    # ログインしている場合は履歴に保存
    if 'user_id' in session:
        db.add_search_history(session['user_id'], query)
    
    results = search_qa(query)
    
    # ログインしている場合はお気に入り状態を追加
    if 'user_id' in session:
        user_id = session['user_id']
        for result in results:
            result['is_favorited'] = db.is_favorited(user_id, result['id'])
    
    return jsonify({'results': results, 'query': query})

@app.route('/api/categories', methods=['GET'])
def categories():
    """カテゴリー一覧取得API"""
    return jsonify({'categories': get_all_categories()})

@app.route('/api/category/<category_id>', methods=['GET'])
def category_detail(category_id):
    """カテゴリー詳細取得API"""
    result = get_category_qas(category_id)
    if result:
        # ログインしている場合はお気に入り状態を追加
        if 'user_id' in session:
            user_id = session['user_id']
            for qa in result['qas']:
                qa['is_favorited'] = db.is_favorited(user_id, qa['id'])
        
        return jsonify(result)
    return jsonify({'error': 'カテゴリーが見つかりません'}), 404

@app.route('/api/stats', methods=['GET'])
def stats():
    """統計情報取得API"""
    total_questions = sum(len(cat['qas']) for cat in qa_data['categories'])
    return jsonify({
        'total_categories': len(qa_data['categories']),
        'total_questions': total_questions
    })

@app.route('/api/qa/<qa_id>', methods=['GET'])
def get_qa_by_id(qa_id):
    """Q&AをIDで取得API"""
    for category in qa_data['categories']:
        for qa in category['qas']:
            if qa['id'] == qa_id:
                result = {
                    'id': qa['id'],
                    'question': qa['question'],
                    'answer': qa['answer'],
                    'category': category['name'],
                    'visual_data': qa.get('visual_data')
                }
                # ログインしている場合はお気に入り状態を追加
                if 'user_id' in session:
                    result['is_favorited'] = db.is_favorited(session['user_id'], qa['id'])
                return jsonify({'qa': result})
    return jsonify({'error': 'Q&Aが見つかりません'}), 404

@app.route('/api/top10', methods=['GET'])
def get_top10():
    """よくある質問TOP10取得API"""
    top10_list = []
    for item in top10_data['top10']:
        # 対応するQ&Aデータを検索
        for category in qa_data['categories']:
            for qa in category['qas']:
                if qa['id'] == item['qa_id']:
                    top10_list.append({
                        'rank': item['rank'],
                        'id': qa['id'],
                        'question': qa['question'],
                        'answer': qa['answer'],
                        'category': item['category'],
                        'visual_data': qa.get('visual_data')
                    })
                    break
    return jsonify({'top10': top10_list})

@app.route('/api/tags', methods=['GET'])
def get_tags():
    """タグ一覧取得API"""
    tags_with_count = []
    for tag, qa_ids in top10_data['tags'].items():
        tags_with_count.append({
            'tag': tag,
            'count': len(qa_ids)
        })
    # 件数でソート
    tags_with_count.sort(key=lambda x: x['count'], reverse=True)
    return jsonify({'tags': tags_with_count})

@app.route('/api/tag/<tag_name>', methods=['GET'])
def get_by_tag(tag_name):
    """タグでQ&A検索API"""
    qa_ids = top10_data['tags'].get(tag_name, [])
    results = []
    
    for category in qa_data['categories']:
        for qa in category['qas']:
            if qa['id'] in qa_ids:
                result = {
                    'id': qa['id'],
                    'question': qa['question'],
                    'answer': qa['answer'],
                    'category': category['name'],
                    'visual_data': qa.get('visual_data')
                }
                # ログインしている場合はお気に入り状態を追加
                if 'user_id' in session:
                    result['is_favorited'] = db.is_favorited(session['user_id'], qa['id'])
                results.append(result)
    
    return jsonify({'tag': tag_name, 'results': results})

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    """検索サジェスト取得API"""
    query = request.args.get('q', '')
    if not query or len(query) < 2:
        return jsonify({'suggestions': top10_data['search_suggestions'][:5]})
    
    # クエリに基づいてサジェストをフィルタリング
    suggestions = []
    query_lower = query.lower()
    
    # 事前定義されたサジェストから検索
    for suggestion in top10_data['search_suggestions']:
        if query_lower in suggestion.lower():
            suggestions.append(suggestion)
    
    # Q&Aの質問からも検索
    for category in qa_data['categories']:
        for qa in category['qas']:
            if query_lower in qa['question'].lower() and qa['question'] not in suggestions:
                suggestions.append(qa['question'])
    
    return jsonify({'suggestions': suggestions[:10]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
