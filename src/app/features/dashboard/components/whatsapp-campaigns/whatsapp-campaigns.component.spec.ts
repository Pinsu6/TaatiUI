import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappCampaignsComponent } from './whatsapp-campaigns.component';

describe('WhatsappCampaignsComponent', () => {
  let component: WhatsappCampaignsComponent;
  let fixture: ComponentFixture<WhatsappCampaignsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WhatsappCampaignsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappCampaignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
