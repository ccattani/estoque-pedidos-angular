import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Movement } from '../models/movement.model';
import { ProductsService } from './products.service';
import { movementSchema } from '../validation/schemas';
import { parseOrThrow } from '../validation/validate';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly baseUrl = '/api/movements';
  private readonly _movements$ = new BehaviorSubject<Movement[]>([]);
  readonly movements$ = this._movements$.asObservable();

  constructor(
    private http: HttpClient,
    private products: ProductsService
  ) {
    this.refresh().subscribe();
  }

  // GET /movements
  list(): Observable<Movement[]> {
    return this.http.get<Movement[]>(this.baseUrl);
  }

  // POST /movements
  registerMovement(m: Omit<Movement, 'id' | 'createdAt'>): Observable<Movement> {
    const payload = parseOrThrow(movementSchema, m);
    return this.http.post<Movement>(this.baseUrl, payload).pipe(
      tap(movement => {
        this._movements$.next([movement, ...this._movements$.value]);
      }),
      tap(() => {
        this.products.refresh().subscribe();
      })
    );
  }

  register(m: Omit<Movement, 'id' | 'createdAt'>): Observable<Movement> {
    return this.registerMovement(m);
  }

  refresh(): Observable<Movement[]> {
    return this.list().pipe(
      tap(movements => {
        this._movements$.next(movements);
      })
    );
  }
}
