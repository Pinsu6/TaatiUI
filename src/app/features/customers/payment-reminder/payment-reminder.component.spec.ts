import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { PaymentReminderComponent } from './payment-reminder.component';

describe('PaymentReminderComponent', () => {
  let component: PaymentReminderComponent;
  let fixture: ComponentFixture<PaymentReminderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentReminderComponent],
      imports: [FormsModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PaymentReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


