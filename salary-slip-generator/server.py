#!/usr/bin/env python3
"""
給与明細書作成ツール - バックエンドサーバー
ログイン機能、データ保存機能を提供
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
import json
from datetime import datetime, timedelta
import os

app = Flask(__name__, static_folder='.')
CORS(app)

# データベースファイル
DB_FILE = 'salary_data.db'

# セッショントークンの有効期限（7日間）
SESSION_EXPIRY = timedelta(days=7)

# アクティブセッション（メモリ内）
active_sessions = {}

def init_db():
    """データベース初期化"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # ユーザーテーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 給与データテーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS salary_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            data_name TEXT NOT NULL,
            month_data TEXT NOT NULL,
            current_format INTEGER DEFAULT 1,
            current_color_index INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # セッショントークンテーブル
    c.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ データベース初期化完了")

def hash_password(password):
    """パスワードをハッシュ化"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    """セッショントークン生成"""
    return secrets.token_urlsafe(32)

def verify_token(token):
    """トークンを検証してユーザーIDを返す"""
    if token in active_sessions:
        session = active_sessions[token]
        if datetime.now() < session['expires_at']:
            return session['user_id']
        else:
            del active_sessions[token]
    
    # データベースから確認
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        SELECT user_id, expires_at FROM sessions 
        WHERE token = ? AND expires_at > ?
    ''', (token, datetime.now()))
    result = c.fetchone()
    conn.close()
    
    if result:
        user_id, expires_at = result
        active_sessions[token] = {
            'user_id': user_id,
            'expires_at': datetime.fromisoformat(expires_at)
        }
        return user_id
    
    return None

@app.route('/')
def index():
    """メインページ"""
    return send_from_directory('.', 'index_6month.html')

@app.route('/<path:path>')
def serve_static(path):
    """静的ファイル配信"""
    return send_from_directory('.', path)

@app.route('/api/register', methods=['POST'])
def register():
    """ユーザー登録"""
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')
    email = data.get('email', '').strip()
    
    if not username or not password:
        return jsonify({'error': 'ユーザー名とパスワードは必須です'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'パスワードは6文字以上必要です'}), 400
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    try:
        password_hash = hash_password(password)
        c.execute('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
                  (username, password_hash, email))
        conn.commit()
        user_id = c.lastrowid
        
        # セッショントークン生成
        token = generate_token()
        expires_at = datetime.now() + SESSION_EXPIRY
        c.execute('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
                  (user_id, token, expires_at))
        conn.commit()
        
        active_sessions[token] = {
            'user_id': user_id,
            'expires_at': expires_at
        }
        
        return jsonify({
            'success': True,
            'token': token,
            'username': username,
            'user_id': user_id
        })
    
    except sqlite3.IntegrityError:
        return jsonify({'error': 'このユーザー名は既に使用されています'}), 400
    finally:
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    """ログイン"""
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'error': 'ユーザー名とパスワードを入力してください'}), 400
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    password_hash = hash_password(password)
    c.execute('SELECT id, username FROM users WHERE username = ? AND password_hash = ?',
              (username, password_hash))
    result = c.fetchone()
    
    if result:
        user_id, username = result
        
        # セッショントークン生成
        token = generate_token()
        expires_at = datetime.now() + SESSION_EXPIRY
        c.execute('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
                  (user_id, token, expires_at))
        conn.commit()
        
        active_sessions[token] = {
            'user_id': user_id,
            'expires_at': expires_at
        }
        
        conn.close()
        return jsonify({
            'success': True,
            'token': token,
            'username': username,
            'user_id': user_id
        })
    
    conn.close()
    return jsonify({'error': 'ユーザー名またはパスワードが正しくありません'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """ログアウト"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if token in active_sessions:
        del active_sessions[token]
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('DELETE FROM sessions WHERE token = ?', (token,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/save', methods=['POST'])
def save_data():
    """データ保存"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': '認証が必要です'}), 401
    
    data = request.json
    data_name = data.get('data_name', f'給与データ_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
    month_data = json.dumps(data.get('month_data', []))
    current_format = data.get('current_format', 1)
    current_color_index = data.get('current_color_index', 0)
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # 既存データがあれば更新、なければ新規作成
    data_id = data.get('data_id')
    
    if data_id:
        c.execute('''
            UPDATE salary_data 
            SET data_name = ?, month_data = ?, current_format = ?, 
                current_color_index = ?, updated_at = ?
            WHERE id = ? AND user_id = ?
        ''', (data_name, month_data, current_format, current_color_index, 
              datetime.now(), data_id, user_id))
    else:
        c.execute('''
            INSERT INTO salary_data 
            (user_id, data_name, month_data, current_format, current_color_index)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, data_name, month_data, current_format, current_color_index))
        data_id = c.lastrowid
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'data_id': data_id,
        'message': 'データを保存しました'
    })

@app.route('/api/list', methods=['GET'])
def list_data():
    """保存データ一覧取得"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': '認証が必要です'}), 401
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        SELECT id, data_name, created_at, updated_at 
        FROM salary_data 
        WHERE user_id = ?
        ORDER BY updated_at DESC
    ''', (user_id,))
    
    results = c.fetchall()
    conn.close()
    
    data_list = []
    for row in results:
        data_list.append({
            'id': row[0],
            'name': row[1],
            'created_at': row[2],
            'updated_at': row[3]
        })
    
    return jsonify({'data_list': data_list})

@app.route('/api/load/<int:data_id>', methods=['GET'])
def load_data(data_id):
    """データ読み込み"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': '認証が必要です'}), 401
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        SELECT data_name, month_data, current_format, current_color_index 
        FROM salary_data 
        WHERE id = ? AND user_id = ?
    ''', (data_id, user_id))
    
    result = c.fetchone()
    conn.close()
    
    if result:
        return jsonify({
            'success': True,
            'data_id': data_id,
            'data_name': result[0],
            'month_data': json.loads(result[1]),
            'current_format': result[2],
            'current_color_index': result[3]
        })
    
    return jsonify({'error': 'データが見つかりません'}), 404

@app.route('/api/delete/<int:data_id>', methods=['DELETE'])
def delete_data(data_id):
    """データ削除"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_token(token)
    
    if not user_id:
        return jsonify({'error': '認証が必要です'}), 401
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('DELETE FROM salary_data WHERE id = ? AND user_id = ?', (data_id, user_id))
    conn.commit()
    affected = c.rowcount
    conn.close()
    
    if affected > 0:
        return jsonify({'success': True, 'message': 'データを削除しました'})
    
    return jsonify({'error': 'データが見つかりません'}), 404

@app.route('/api/verify', methods=['GET'])
def verify_session():
    """セッション検証"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_token(token)
    
    if user_id:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('SELECT username FROM users WHERE id = ?', (user_id,))
        result = c.fetchone()
        conn.close()
        
        if result:
            return jsonify({
                'valid': True,
                'user_id': user_id,
                'username': result[0]
            })
    
    return jsonify({'valid': False}), 401

if __name__ == '__main__':
    # データベース初期化
    init_db()
    
    # サーバー起動
    print("🚀 給与明細書作成ツール - サーバー起動中...")
    print("📍 アクセスURL: http://0.0.0.0:8001")
    app.run(host='0.0.0.0', port=8001, debug=True)
