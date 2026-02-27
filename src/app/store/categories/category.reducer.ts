import { createReducer, on } from '@ngrx/store';
import * as CategoryActions from './category.actions';
import { Category } from '../../shared/interfaces/category.interface';

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const categoryReducer = createReducer(
  initialState,
  on(CategoryActions.loadCategories, (state) => ({ ...state, loading: true })),
  on(CategoryActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    loading: false,
  })),
  on(CategoryActions.addCategory, (state, { category }) => ({
    ...state,
    categories: [...state.categories, category],
  })),
  on(CategoryActions.updateCategory, (state, { category }) => ({
    ...state,
    categories: state.categories.map((c) => (c.id === category.id ? category : c)),
  })),
  on(CategoryActions.deleteCategory, (state, { id }) => ({
    ...state,
    categories: state.categories.filter((c) => c.id !== id),
  })),
);
