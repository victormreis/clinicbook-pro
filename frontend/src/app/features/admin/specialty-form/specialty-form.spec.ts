import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialtyForm } from './specialty-form.component';

describe('SpecialtyForm', () => {
  let component: SpecialtyForm;
  let fixture: ComponentFixture<SpecialtyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialtyForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialtyForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
