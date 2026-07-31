import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="cd-overlay" *ngIf="config" (click)="dismiss()">
      <div class="cd-modal" (click)="$event.stopPropagation()">
        <div class="cd-header">
          <h3>{{ config.title }}</h3>
          <button class="cd-close" (click)="dismiss()">&times;</button>
        </div>
        <div class="cd-body">
          <p>{{ config.message }}</p>
        </div>
        <div class="cd-footer">
          <button class="btn btn-secondary" (click)="dismiss()" *ngIf="config.type !== 'alert'">Cancel</button>
          <button class="btn" [ngClass]="btnClass" (click)="confirm()">
            {{ config.type === 'delete' ? 'Delete' : config.type === 'alert' ? 'OK' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cd-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
      z-index: 2000;
    }
    .cd-modal {
      background: #fff; border-radius: 12px; padding: 0; max-width: 400px; width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .cd-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px 0;
    }
    .cd-header h3 { margin: 0; font-size: 18px; color: #1a1d29; }
    .cd-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; padding: 0; line-height: 1; }
    .cd-body { padding: 12px 24px 20px; }
    .cd-body p { margin: 0; font-size: 14px; color: #555; line-height: 1.5; }
    .cd-footer {
      display: flex; gap: 10px; justify-content: flex-end;
      padding: 16px 24px; border-top: 1px solid #f0f0f0;
    }
    .btn {
      padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.15s;
    }
    .btn:hover { opacity: 0.85; }
    .btn-primary { background: #ff6b35; color: #fff; }
    .btn-secondary { background: #f0f0f0; color: #555; }
    .btn-danger { background: #e53935; color: #fff; }
  `]
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  config: any = null;
  private sub!: Subscription;

  constructor(private service: ConfirmDialogService) {}

  ngOnInit() {
    this.sub = this.service.getConfig().subscribe(c => this.config = c);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  get btnClass() {
    return this.config?.type === 'delete' ? 'btn-danger' : 'btn-primary';
  }

  confirm() {
    this.service.respond(true);
  }

  dismiss() {
    this.service.respond(false);
  }
}
