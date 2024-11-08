import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: Category[] = [];
  private categoriesSubject = new BehaviorSubject<Category[]>([]);

  getCategories(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  addCategory(category: Category): void {
    this.categories.push(category);
    this.categoriesSubject.next([...this.categories]);
  }

  updateCategory(updatedCategory: Category): void {
    const index = this.categories.findIndex(category => category.id === updatedCategory.id);
    if (index !== -1) {
      this.categories[index] = updatedCategory;
      this.categoriesSubject.next([...this.categories]);
    }
  }

  deleteCategory(categoryId: string): void {
    this.categories = this.categories.filter(category => category.id !== categoryId);
    this.categoriesSubject.next([...this.categories]);
  }
}
