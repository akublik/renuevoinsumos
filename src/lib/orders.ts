

export type OrderStatus = 'Pendiente' | 'Pagado' | 'Entregado' | 'Cancelado';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  paymentMethod: 'cash' | 'transfer';
}

export interface OrderData {
  userId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

export interface Order extends OrderData {
  id: string;
  createdAt: Date;
}
