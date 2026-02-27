import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { TimerComponent } from './timer.component';
import { initialState } from '../../store/tasks/task.reducer';

describe('TimerComponent', () => {
  let component: TimerComponent;
  let fixture: ComponentFixture<TimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimerComponent],
      providers: [provideMockStore({ initialState: { tasks: initialState } })],
    }).compileComponents();

    fixture = TestBed.createComponent(TimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
