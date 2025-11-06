import { useState, useEffect } from 'react'
import { FileText, Trash2, Calendar, Edit2, X } from 'lucide-react'
import './DraftList.css'

interface Draft {
  id: string
  title: string
  username: string
  data: any
  createdAt: string
  updatedAt: string
}

interface DraftListProps {
  username: string
  onLoadDraft: (data: any) => void
  onClose: () => void
}

const DraftList = ({ username, onLoadDraft, onClose }: DraftListProps) => {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  // 下書き一覧を読み込み
  useEffect(() => {
    loadDrafts()
  }, [username])

  const loadDrafts = () => {
    const allDraftsKey = 'expenseDrafts'
    const allDraftsJson = localStorage.getItem(allDraftsKey)
    
    if (allDraftsJson) {
      try {
        const allDrafts: Draft[] = JSON.parse(allDraftsJson)
        // 現在のユーザーの下書きのみフィルタリング
        const userDrafts = allDrafts.filter(draft => draft.username === username)
        // 更新日時で降順ソート
        userDrafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        setDrafts(userDrafts)
      } catch (e) {
        console.error('Failed to load drafts', e)
      }
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('この下書きを削除しますか？')) return

    const allDraftsKey = 'expenseDrafts'
    const allDraftsJson = localStorage.getItem(allDraftsKey)
    
    if (allDraftsJson) {
      try {
        const allDrafts: Draft[] = JSON.parse(allDraftsJson)
        const updatedDrafts = allDrafts.filter(draft => draft.id !== id)
        localStorage.setItem(allDraftsKey, JSON.stringify(updatedDrafts))
        loadDrafts()
      } catch (e) {
        console.error('Failed to delete draft', e)
      }
    }
  }

  const handleLoad = (draft: Draft) => {
    if (confirm(`「${draft.title}」を読み込みますか？\n※現在の入力内容は上書きされます`)) {
      onLoadDraft(draft.data)
      onClose()
    }
  }

  const startEditTitle = (draft: Draft) => {
    setEditingId(draft.id)
    setEditingTitle(draft.title)
  }

  const saveTitle = (id: string) => {
    if (!editingTitle.trim()) {
      alert('タイトルを入力してください')
      return
    }

    const allDraftsKey = 'expenseDrafts'
    const allDraftsJson = localStorage.getItem(allDraftsKey)
    
    if (allDraftsJson) {
      try {
        const allDrafts: Draft[] = JSON.parse(allDraftsJson)
        const draftIndex = allDrafts.findIndex(draft => draft.id === id)
        
        if (draftIndex !== -1) {
          allDrafts[draftIndex].title = editingTitle.trim()
          allDrafts[draftIndex].updatedAt = new Date().toISOString()
          localStorage.setItem(allDraftsKey, JSON.stringify(allDrafts))
          loadDrafts()
        }
      } catch (e) {
        console.error('Failed to update title', e)
      }
    }
    
    setEditingId(null)
    setEditingTitle('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="draft-list-overlay">
      <div className="draft-list-modal">
        <div className="draft-list-header">
          <h2>
            <FileText size={24} />
            下書き一覧
          </h2>
          <button onClick={onClose} className="btn-close-modal">
            <X size={24} />
          </button>
        </div>

        <div className="draft-list-info">
          <p>👤 {username} さんの下書き：{drafts.length}件</p>
        </div>

        <div className="draft-list-container">
          {drafts.length === 0 ? (
            <div className="no-drafts">
              <p>保存された下書きはありません</p>
              <p className="hint">プランナー画面で「💾 下書きを保存」ボタンを押すと保存できます</p>
            </div>
          ) : (
            <div className="draft-cards">
              {drafts.map(draft => (
                <div key={draft.id} className="draft-card">
                  <div className="draft-card-header">
                    {editingId === draft.id ? (
                      <div className="title-edit-inline">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          autoFocus
                          placeholder="下書きのタイトル"
                        />
                        <button onClick={() => saveTitle(draft.id)} className="btn-save-title">
                          ✓
                        </button>
                        <button onClick={cancelEdit} className="btn-cancel-title">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3>{draft.title}</h3>
                        <button 
                          onClick={() => startEditTitle(draft)}
                          className="btn-edit-title"
                          title="タイトルを編集"
                        >
                          <Edit2 size={16} />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="draft-card-info">
                    <div className="info-row">
                      <Calendar size={14} />
                      <span className="label">作成:</span>
                      <span>{formatDate(draft.createdAt)}</span>
                    </div>
                    <div className="info-row">
                      <Calendar size={14} />
                      <span className="label">更新:</span>
                      <span>{formatDate(draft.updatedAt)}</span>
                    </div>
                    {draft.data.businessName && (
                      <div className="info-row">
                        <span className="label">事業者名:</span>
                        <span>{draft.data.businessName}</span>
                      </div>
                    )}
                    {draft.data.expenses && (
                      <div className="info-row">
                        <span className="label">経費項目:</span>
                        <span>{draft.data.expenses.length}件</span>
                      </div>
                    )}
                  </div>

                  <div className="draft-card-actions">
                    <button 
                      onClick={() => handleLoad(draft)}
                      className="btn-load-draft"
                    >
                      読み込む
                    </button>
                    <button 
                      onClick={() => handleDelete(draft.id)}
                      className="btn-delete-draft"
                    >
                      <Trash2 size={16} />
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="draft-list-footer">
          <button onClick={onClose} className="btn-close">
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

export default DraftList
