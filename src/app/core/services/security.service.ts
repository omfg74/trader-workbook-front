import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Security, SecurityRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private readonly readBase = `${environment.apiUrl}/api/v1/securities`;
  private readonly adminBase = `${environment.apiUrl}/api/v1/admin/securities`;

  constructor(private readonly http: HttpClient) {}

  getSecurities(q?: string): Observable<Security[]> {
    let params = new HttpParams();
    if (q?.trim()) {
      params = params.set('q', q.trim());
    }
    return this.http.get<Security[]>(this.readBase, { params });
  }

  create(data: SecurityRequest): Observable<Security> {
    return this.http.post<Security>(this.adminBase, data);
  }

  update(id: number, data: SecurityRequest): Observable<Security> {
    return this.http.put<Security>(`${this.adminBase}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/${id}`);
  }
}
