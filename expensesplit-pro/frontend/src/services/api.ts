import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import type { 
  User, Group, Expense, CreateExpenseDto, 
  SettlementDto, ApiResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`📥 ${response.status} ${response.config.url}`, response.data);
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 400:
          toast.error(data?.message || 'Invalid request');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data?.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Cannot connect to server. Is the backend running?');
    } else {
      toast.error('Request failed');
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response = await this.client.get<ApiResponse<User[]>>('/users');
    return response.data.data || response.data as any;
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    const response = await this.client.get<ApiResponse<Group[]>>('/groups');
    return response.data.data || response.data as any;
  }

  async getGroup(id: number): Promise<Group> {
    const response = await this.client.get<ApiResponse<Group>>(`/groups/${id}`);
    return response.data.data || response.data as any;
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const response = await this.client.get<ApiResponse<Expense[]>>('/expenses');
    return response.data.data || response.data as any;
  }

  async createExpense(expense: CreateExpenseDto): Promise<Expense> {
    const response = await this.client.post<ApiResponse<Expense>>('/expenses', expense);
    return response.data.data || response.data as any;
  }

  async deleteExpense(id: number): Promise<void> {
    await this.client.delete(`/expenses/${id}`);
  }

  // Settlements
  async getOptimizedSettlements(groupId: number): Promise<SettlementDto[]> {
    const response = await this.client.get<ApiResponse<SettlementDto[]>>(`/groups/${groupId}/optimize`);
    return response.data.data || response.data as any;
  }
}

export const api = new ApiService();
export default api;
