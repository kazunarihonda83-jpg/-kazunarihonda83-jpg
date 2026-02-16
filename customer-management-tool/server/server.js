const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database
let customers = [
  { id: 1, name: '山田太郎', email: 'yamada@example.com', phone: '090-1234-5678', company: 'ABC会社' },
  { id: 2, name: '佐藤花子', email: 'sato@example.com', phone: '090-2345-6789', company: 'XYZ会社' }
];

let nextId = 3;

// GET - すべての顧客を取得
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

// GET - 特定の顧客を取得
app.get('/api/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) {
    return res.status(404).json({ message: '顧客が見つかりません' });
  }
  res.json(customer);
});

// POST - 新しい顧客を追加
app.post('/api/customers', (req, res) => {
  const { name, email, phone, company } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: '名前とメールアドレスは必須です' });
  }

  const newCustomer = {
    id: nextId++,
    name,
    email,
    phone: phone || '',
    company: company || ''
  };

  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// PUT - 顧客情報を更新
app.put('/api/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) {
    return res.status(404).json({ message: '顧客が見つかりません' });
  }

  const { name, email, phone, company } = req.body;
  if (name) customer.name = name;
  if (email) customer.email = email;
  if (phone) customer.phone = phone;
  if (company) customer.company = company;

  res.json(customer);
});

// DELETE - 顧客を削除
app.delete('/api/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: '顧客が見つかりません' });
  }

  const deletedCustomer = customers.splice(index, 1);
  res.json(deletedCustomer[0]);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
