import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageTestComponent } from './image-test.component';

describe('ImageTestComponent', () => {
  let component: ImageTestComponent;
  let fixture: ComponentFixture<ImageTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
