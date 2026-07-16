import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReferenceRequest, SecurityType } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class SecurityTypeService {
  private readonly readBase = `${environment.apiUrl}/api/v1/security-types`;
  private readonly adminBase = `${environment.apiUrl}/api/v1/admin/security-types`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<SecurityType[]> {
    return this.http.get<SecurityType[]>(this.readBase);
  }

  create(data: ReferenceRequest): Observable<SecurityType> {
    return this.http.post<SecurityType>(this.adminBase, data);
  }

  update(id: number, data: ReferenceRequest): Observable<SecurityType> {
    return this.http.put<SecurityType>(`${this.adminBase}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/${id}`);
  }
}
