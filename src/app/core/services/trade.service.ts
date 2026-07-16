import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Page,
  Trade,
  TradeCreateRequest,
  TradeFilters,
  TradeUpdateRequest,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class TradeService {
  private readonly base = `${environment.apiUrl}/api/v1/trades`;

  constructor(private readonly http: HttpClient) {}

  getTrades(filters: TradeFilters = {}): Observable<Page<Trade>> {
    let params = new HttpParams();
    if (filters.all) {
      params = params.set('all', 'true');
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.securityId != null) {
      params = params.set('securityId', String(filters.securityId));
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    if (filters.page != null) {
      params = params.set('page', String(filters.page));
    }
    if (filters.size != null) {
      params = params.set('size', String(filters.size));
    }
    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }
    return this.http.get<Page<Trade>>(this.base, { params });
  }

  getTrade(id: number): Observable<Trade> {
    return this.http.get<Trade>(`${this.base}/${id}`);
  }

  createTrade(data: TradeCreateRequest): Observable<Trade> {
    return this.http.post<Trade>(this.base, data);
  }

  updateTrade(id: number, data: TradeUpdateRequest): Observable<Trade> {
    return this.http.patch<Trade>(`${this.base}/${id}`, data);
  }

  deleteTrade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
