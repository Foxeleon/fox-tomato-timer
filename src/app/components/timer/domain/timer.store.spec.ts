import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { TimerStore } from './timer.store';
import { timerCompleted } from '../../../store/timer/timer.actions';

describe('TimerStore', () => {
  let store: InstanceType<typeof TimerStore>;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [TimerStore, provideMockStore()],
    });
    store = TestBed.inject(TimerStore);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialise with idle status and 25-minute duration', () => {
    expect(store.status()).toBe('idle');
    expect(store.remainingMs()).toBe(25 * 60 * 1000);
    expect(store.mode()).toBe('pomodoro');
  });

  it('start() should set status to running', () => {
    store.start(5000);
    expect(store.status()).toBe('running');
    expect(store.remainingMs()).toBe(5000);
  });

  it('start() should decrement remainingMs by 1000 each second', () => {
    store.start(5000);

    jest.advanceTimersByTime(1000);
    expect(store.remainingMs()).toBe(4000);

    jest.advanceTimersByTime(2000);
    expect(store.remainingMs()).toBe(2000);
  });

  it('should dispatch timerCompleted and set status to completed when remainingMs reaches 0', () => {
    const globalStore = TestBed.inject(Store) as unknown as { dispatch: jest.Mock };
    const dispatchSpy = jest.spyOn(globalStore, 'dispatch');

    store.start(2000);
    jest.advanceTimersByTime(3000);

    expect(store.status()).toBe('completed');
    expect(store.remainingMs()).toBe(0);
    expect(dispatchSpy).toHaveBeenCalledWith(timerCompleted());
  });

  it('pause() should stop ticking and set status to paused', () => {
    store.start(5000);
    jest.advanceTimersByTime(1000);

    store.pause();
    expect(store.status()).toBe('paused');

    jest.advanceTimersByTime(2000);
    expect(store.remainingMs()).toBe(4000);
  });

  it('resume() should continue ticking from paused state', () => {
    store.start(5000);
    jest.advanceTimersByTime(1000);
    store.pause();

    store.resume();
    expect(store.status()).toBe('running');

    jest.advanceTimersByTime(1000);
    expect(store.remainingMs()).toBe(3000);
  });

  it('resume() should be a no-op when not paused', () => {
    store.start(5000);
    store.resume();
    jest.advanceTimersByTime(1000);
    expect(store.remainingMs()).toBe(4000);
  });

  it('reset() should stop timer and restore to baseDurationMs', () => {
    store.start(5000);
    jest.advanceTimersByTime(1000);

    store.reset();
    expect(store.status()).toBe('idle');
    expect(store.remainingMs()).toBe(5000);

    jest.advanceTimersByTime(2000);
    expect(store.remainingMs()).toBe(5000);
  });

  it('reset(newDurationMs) should set a new base duration', () => {
    store.reset(10000);
    expect(store.status()).toBe('idle');
    expect(store.remainingMs()).toBe(10000);
  });
});
