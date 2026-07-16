import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role, User } from '../../core/models/api.models';

@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [DatePipe, MatTableModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './user-manage.component.html',
  styleUrl: './admin-table.scss',
})
export class UserManageComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly notifications = inject(NotificationService);

  displayedColumns = ['username', 'role', 'createdAt'];
  rows: User[] = [];
  roles: Role[] = ['USER', 'ADMIN'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.userService.list().subscribe({
      next: (rows) => (this.rows = rows),
      error: (err) => this.notifications.fromHttpError(err),
    });
  }

  changeRole(user: User, role: Role): void {
    if (user.role === role) {
      return;
    }
    this.userService.updateRole(user.id, { role }).subscribe({
      next: (updated) => {
        this.rows = this.rows.map((u) => (u.id === updated.id ? updated : u));
        this.notifications.showSuccess(`Роль ${updated.username}: ${updated.role}`);
      },
      error: (err) => this.notifications.fromHttpError(err),
    });
  }
}
