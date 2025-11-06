import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private exportModalState = new BehaviorSubject<boolean>(false);
  exportModalState$ = this.exportModalState.asObservable();
  private quickActionModalState = new BehaviorSubject<boolean>(false);
  quickActionModalState$ = this.quickActionModalState.asObservable();

  openExportModal() { this.exportModalState.next(true); }
  closeExportModal() { this.exportModalState.next(false); }
  openQuickActionModal() { this.quickActionModalState.next(true); }
  closeQuickActionModal() { this.quickActionModalState.next(false); }
  constructor() { }
}
