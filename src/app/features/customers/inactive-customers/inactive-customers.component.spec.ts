import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveCustomersComponent } from './inactive-customers.component';

describe('InactiveCustomersComponent', () => {
  let component: InactiveCustomersComponent;
  let fixture: ComponentFixture<InactiveCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InactiveCustomersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
