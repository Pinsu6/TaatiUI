import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { WhatsappOrderSummaryComponent } from './whatsapp-order-summary.component';

describe('WhatsappOrderSummaryComponent', () => {
  let component: WhatsappOrderSummaryComponent;
  let fixture: ComponentFixture<WhatsappOrderSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WhatsappOrderSummaryComponent],
      imports: [FormsModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WhatsappOrderSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

