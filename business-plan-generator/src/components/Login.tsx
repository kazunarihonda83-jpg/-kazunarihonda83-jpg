import { useState } from 'react'
import { Lock, User } from 'lucide-react'
import './Login.css'

interface LoginProps {
  onLogin: (username: string) => void
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // デモ用の認証情報（本番環境では必ずバックエンドで検証してください）
  const VALID_CREDENTIALS = {
    admin: 'admin123',
    user1: 'password123',
    demo: 'demo2024'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 認証チェック
    if (VALID_CREDENTIALS[username as keyof typeof VALID_CREDENTIALS] === password) {
      // ログイン成功
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', username)
      localStorage.setItem('loginTime', new Date().toISOString())
      onLogin(username)
    } else {
      setError('ユーザー名またはパスワードが正しくありません')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <Lock size={48} />
          </div>
          <h1>補助金経費項目プランナー</h1>
          <p>会員専用ページ</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <User size={20} />
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={20} />
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn-login">
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
