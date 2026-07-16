export type Role = 'USER' | 'ADMIN';
export type Side = 'BUY' | 'SELL';
export type TradeStatus = 'OPEN' | 'CLOSED';

export interface User {
  id: number;
  username: string;
  role: Role;
  createdAt: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface Trade {
  id: number;
  userId: number;
  username: string;
  securityId: number;
  securityTicker: string;
  securityName: string;
  side: Side;
  purchasePrice: number;
  exchangeCommission: number;
  brokerCommission: number;
  comment: string | null;
  purchaseDate: string;
  sellPrice: number | null;
  sellDate: string | null;
  status: TradeStatus;
  pnl: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TradeCreateRequest {
  securityId: number;
  side?: Side;
  purchasePrice: number;
  exchangeCommission: number;
  brokerCommission: number;
  comment?: string | null;
  purchaseDate?: string | null;
}

export interface TradeUpdateRequest {
  securityId?: number;
  side?: Side;
  purchasePrice?: number;
  exchangeCommission?: number;
  brokerCommission?: number;
  comment?: string | null;
  purchaseDate?: string | null;
  sellPrice?: number | null;
  sellDate?: string | null;
  clearSale?: boolean;
}

export interface TradeFilters {
  all?: boolean;
  status?: TradeStatus | '';
  securityId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  page?: number;
  size?: number;
  sort?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export interface SecurityType {
  id: number;
  name: string;
  description: string | null;
}

export interface Issuer {
  id: number;
  name: string;
  description: string | null;
}

export interface Security {
  id: number;
  ticker: string;
  name: string;
  typeId: number;
  typeName: string;
  issuerId: number | null;
  issuerName: string | null;
  description: string | null;
}

export interface ReferenceRequest {
  name: string;
  description?: string | null;
}

export interface SecurityRequest {
  ticker: string;
  name: string;
  typeId: number;
  issuerId?: number | null;
  description?: string | null;
}

export interface UpdateUserRoleRequest {
  role: Role;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}
