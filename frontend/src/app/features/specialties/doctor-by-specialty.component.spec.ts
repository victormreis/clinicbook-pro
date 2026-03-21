import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorBySpecialtyComponent } from './doctor-by-specialty.component';

describe('DoctorBySpecialtyComponent', () => {
  let component: DoctorBySpecialtyComponent;
  let fixture: ComponentFixture<DoctorBySpecialtyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorBySpecialtyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorBySpecialtyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
