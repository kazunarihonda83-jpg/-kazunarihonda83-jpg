import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CustomerService = {
  // すべての顧客を取得
  getAllCustomers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // 特定の顧客を取得
  getCustomerById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  },

  // 新しい顧客を作成
  createCustomer: async (customer) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/customers`, customer);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // 顧客を更新
  updateCustomer: async (id, customer) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/customers/${id}`, customer);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  },

  // 顧客を削除
  deleteCustomer: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }
};

export default CustomerService;
