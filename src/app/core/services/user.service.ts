import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UpdateUserRoleRequest, User } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = `${environment.apiUrl}/api/v1/admin/users`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  updateRole(id: number, data: UpdateUserRoleRequest): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, data);
  }
}
