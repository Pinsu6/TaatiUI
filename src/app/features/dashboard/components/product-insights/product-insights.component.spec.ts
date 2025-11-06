import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductInsightsComponent } from './product-insights.component';

describe('ProductInsightsComponent', () => {
  let component: ProductInsightsComponent;
  let fixture: ComponentFixture<ProductInsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductInsightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
