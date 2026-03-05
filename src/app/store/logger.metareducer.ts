import { ActionReducer, Action } from '@ngrx/store';

export function debugMetaReducer<State, A extends Action = Action>(
  reducer: ActionReducer<State, A>,
): ActionReducer<State, A> {
  return function (state: State | undefined, action: A): State {
    console.groupCollapsed(`[NgRx Action] ${action.type}`);
    console.log('Prev State:', state);
    console.log('Action:', action);
    const nextState = reducer(state, action);
    console.log('Next State:', nextState);
    console.groupEnd();
    return nextState;
  };
}
