import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorOutreachComponent } from './doctor-outreach.component';

describe('DoctorOutreachComponent', () => {
  let component: DoctorOutreachComponent;
  let fixture: ComponentFixture<DoctorOutreachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DoctorOutreachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorOutreachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
