
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
  customer: CustomerInfo;
  items: OrderItem[];
  total: number;
  status: 'Pendiente' | 'Enviado' | 'Entregado' | 'Cancelado';
}

export interface Order extends OrderData {
  id: string;
  createdAt: Date;
}
