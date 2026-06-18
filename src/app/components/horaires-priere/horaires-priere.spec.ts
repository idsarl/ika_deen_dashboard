import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorairesPriere } from './horaires-priere';

describe('HorairesPriere', () => {
  let component: HorairesPriere;
  let fixture: ComponentFixture<HorairesPriere>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorairesPriere]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorairesPriere);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
