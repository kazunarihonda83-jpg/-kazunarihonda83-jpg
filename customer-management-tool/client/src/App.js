import React, { useState, useEffect } from 'react';
import './App.css';
import CustomerService from './services/CustomerService';

function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  // 顧客一覧を読み込む
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CustomerService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError('顧客情報の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('名前とメールアドレスは必須です');
      return;
    }

    try {
      if (editingId) {
        // 更新
        await CustomerService.updateCustomer(editingId, formData);
        setEditingId(null);
      } else {
        // 新規作成
        await CustomerService.createCustomer(formData);
      }
      setFormData({ name: '', email: '', phone: '', company: '' });
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      setError(editingId ? '顧客情報の更新に失敗しました' : '顧客の追加に失敗しました');
      console.error(err);
    }
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('この顧客を削除してもよろしいですか？')) {
      setError(null);
      try {
        await CustomerService.deleteCustomer(id);
        fetchCustomers();
      } catch (err) {
        setError('顧客の削除に失敗しました');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '', company: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>顧客管理ツール</h1>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'キャンセル' : '新規顧客を追加'}
        </button>
        <button className="btn btn-secondary" onClick={fetchCustomers}>
          更新
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? '顧客情報を編集' : '新規顧客を追加'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">名前 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">メールアドレス *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">電話番号</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">会社名</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? '更新' : '追加'}
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCancel}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p className="loading">読み込み中...</p>}

      {!loading && customers.length === 0 && !showForm && (
        <p className="no-customers">顧客情報がありません</p>
      )}

      {!loading && customers.length > 0 && (
        <div className="customers-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>名前</th>
                <th>メールアドレス</th>
                <th>電話番号</th>
                <th>会社名</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.company}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(customer)}
                    >
                      編集
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(customer.id)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
