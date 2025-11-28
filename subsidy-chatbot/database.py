import sqlite3
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

DATABASE = 'subsidy_chatbot.db'

def get_db():
    """データベース接続を取得"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """データベースを初期化"""
    conn = get_db()
    cursor = conn.cursor()
    
    # ユーザーテーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # お気に入りテーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            qa_id TEXT NOT NULL,
            question TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, qa_id)
        )
    ''')
    
    # 検索履歴テーブル
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            query TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def create_user(username, email, password):
    """新規ユーザーを作成"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        password_hash = generate_password_hash(password)
        
        cursor.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return {'success': True, 'user_id': user_id}
    except sqlite3.IntegrityError as e:
        return {'success': False, 'error': 'ユーザー名またはメールアドレスが既に使用されています'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def verify_user(username, password):
    """ユーザー認証"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    
    if user and check_password_hash(user['password_hash'], password):
        return {
            'success': True,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        }
    return {'success': False, 'error': 'ユーザー名またはパスワードが正しくありません'}

def get_user_by_id(user_id):
    """ユーザーIDからユーザー情報を取得"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, username, email FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {
            'id': user['id'],
            'username': user['username'],
            'email': user['email']
        }
    return None

def add_favorite(user_id, qa_id, question):
    """お気に入りを追加"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            'INSERT INTO favorites (user_id, qa_id, question) VALUES (?, ?, ?)',
            (user_id, qa_id, question)
        )
        conn.commit()
        conn.close()
        return {'success': True}
    except sqlite3.IntegrityError:
        return {'success': False, 'error': '既にお気に入りに追加されています'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def remove_favorite(user_id, qa_id):
    """お気に入りを削除"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            'DELETE FROM favorites WHERE user_id = ? AND qa_id = ?',
            (user_id, qa_id)
        )
        conn.commit()
        conn.close()
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_user_favorites(user_id):
    """ユーザーのお気に入り一覧を取得"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT qa_id, question, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
        (user_id,)
    )
    favorites = cursor.fetchall()
    conn.close()
    
    return [{'id': fav['qa_id'], 'question': fav['question']} for fav in favorites]

def is_favorited(user_id, qa_id):
    """お気に入りに登録されているか確認"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT COUNT(*) as count FROM favorites WHERE user_id = ? AND qa_id = ?',
        (user_id, qa_id)
    )
    result = cursor.fetchone()
    conn.close()
    
    return result['count'] > 0

def add_search_history(user_id, query):
    """検索履歴を追加"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            'INSERT INTO search_history (user_id, query) VALUES (?, ?)',
            (user_id, query)
        )
        conn.commit()
        conn.close()
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_user_search_history(user_id, limit=5):
    """ユーザーの検索履歴を取得"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        '''
        SELECT DISTINCT query FROM search_history 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
        ''',
        (user_id, limit)
    )
    history = cursor.fetchall()
    conn.close()
    
    return [row['query'] for row in history]

def delete_search_history_item(user_id, query):
    """特定の検索履歴を削除"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            'DELETE FROM search_history WHERE user_id = ? AND query = ?',
            (user_id, query)
        )
        conn.commit()
        conn.close()
        return {'success': True}
    except Exception as e:
        return {'success': False, 'error': str(e)}

# データベースの初期化
if __name__ == '__main__':
    init_db()
    print("データベースを初期化しました")
