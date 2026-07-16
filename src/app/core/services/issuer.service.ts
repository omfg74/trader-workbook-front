import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Issuer, ReferenceRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class IssuerService {
  private readonly readBase = `${environment.apiUrl}/api/v1/issuers`;
  private readonly adminBase = `${environment.apiUrl}/api/v1/admin/issuers`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Issuer[]> {
    return this.http.get<Issuer[]>(this.readBase);
  }

  create(data: ReferenceRequest): Observable<Issuer> {
    return this.http.post<Issuer>(this.adminBase, data);
  }

  update(id: number, data: ReferenceRequest): Observable<Issuer> {
    return this.http.put<Issuer>(`${this.adminBase}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/${id}`);
  }
}
