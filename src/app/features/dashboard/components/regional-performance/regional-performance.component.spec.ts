import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionalPerformanceComponent } from './regional-performance.component';

describe('RegionalPerformanceComponent', () => {
  let component: RegionalPerformanceComponent;
  let fixture: ComponentFixture<RegionalPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegionalPerformanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegionalPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
