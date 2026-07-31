import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  type: 'confirm' | 'delete' | 'alert';
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private config$ = new Subject<ConfirmDialogConfig | null>();
  private result$ = new Subject<boolean>();

  open(config: ConfirmDialogConfig): Observable<boolean> {
    this.config$.next(config);
    const s = new Subject<boolean>();
    this.result$ = s;
    return s.asObservable();
  }

  confirm(title: string, message: string): Observable<boolean> {
    return this.open({ title, message, type: 'confirm' });
  }

  delete(title: string, message: string): Observable<boolean> {
    return this.open({ title, message, type: 'delete' });
  }

  alert(title: string, message: string): Observable<boolean> {
    return this.open({ title, message, type: 'alert' });
  }

  getConfig() {
    return this.config$.asObservable();
  }

  respond(result: boolean) {
    this.result$.next(result);
    this.result$.complete();
    this.config$.next(null);
  }
}
