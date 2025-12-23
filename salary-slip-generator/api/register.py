"""
Vercel Serverless Function - ユーザー登録
"""
from http.server import BaseHTTPRequestHandler
import json
import hashlib
import secrets
from datetime import datetime, timedelta
import os

# 環境変数からデータベースURL取得（将来的にSupabaseなどに対応）
DATABASE_URL = os.environ.get('DATABASE_URL', '')

# 簡易インメモリストレージ（本番では外部DBを使用）
users_data = {}
sessions_data = {}
salary_data = {}

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    return secrets.token_urlsafe(32)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        email = data.get('email', '').strip()
        
        if not username or not password:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'error': 'ユーザー名とパスワードは必須です'}
            self.wfile.write(json.dumps(response).encode())
            return
        
        if len(password) < 6:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'error': 'パスワードは6文字以上必要です'}
            self.wfile.write(json.dumps(response).encode())
            return
        
        # ユーザー重複チェック
        if username in users_data:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'error': 'このユーザー名は既に使用されています'}
            self.wfile.write(json.dumps(response).encode())
            return
        
        # ユーザー作成
        user_id = len(users_data) + 1
        password_hash = hash_password(password)
        users_data[username] = {
            'id': user_id,
            'username': username,
            'password_hash': password_hash,
            'email': email,
            'created_at': datetime.now().isoformat()
        }
        
        # セッショントークン生成
        token = generate_token()
        expires_at = datetime.now() + timedelta(days=7)
        sessions_data[token] = {
            'user_id': user_id,
            'username': username,
            'expires_at': expires_at.isoformat()
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'success': True,
            'token': token,
            'username': username,
            'user_id': user_id
        }
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
