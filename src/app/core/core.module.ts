import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './services/modal.service';
import { AuthService } from './services/auth.service';
import { RefreshService } from './services/refresh.service';
import { AuthGuard } from './services/auth.guard';
import { LoggedInGuard } from './services/logged-in-guard.guard';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [ModalService, AuthService,RefreshService,AuthGuard,LoggedInGuard]
})
export class CoreModule { }
