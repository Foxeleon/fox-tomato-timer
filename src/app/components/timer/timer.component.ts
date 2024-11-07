import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as TimerActions from '../../store/actions/timer.actions';
import { TimerState } from '../../store/reducers/timer.reducer';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  timerState$: Observable<TimerState>;

  constructor(private store: Store<{ timer: TimerState }>) {
    this.timerState$ = store.select(state => state.timer);
  }

  ngOnInit(): void {}

  startTimer(): void {
    this.store.dispatch(TimerActions.startTimer({ duration: 1500 })); // 25 minutes
  }

  stopTimer(): void {
    this.store.dispatch(TimerActions.stopTimer());
  }

  resetTimer(): void {
    this.store.dispatch(TimerActions.resetTimer());
  }
}
