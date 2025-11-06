import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryAnalysisComponent } from './inventory-analysis.component';

describe('InventoryAnalysisComponent', () => {
  let component: InventoryAnalysisComponent;
  let fixture: ComponentFixture<InventoryAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventoryAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
