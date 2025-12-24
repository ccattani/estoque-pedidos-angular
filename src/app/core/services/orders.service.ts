import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { Order } from "../models/pedido.model";
import { orderDraftSchema } from "../validation/schemas";
import { parseOrThrow } from "../validation/validate";

@Injectable({ providedIn: "root" })
export class OrdersService {
  private readonly baseUrl = "/api/orders";
  private readonly _orders$ = new BehaviorSubject<Order[]>([]);
  readonly orders$ = this._orders$.asObservable();

  constructor(private http: HttpClient) {
    this.refresh().subscribe();
  }

  get snapshot(): Order[] {
    return this._orders$.value;
  }

  // GET /orders
  list(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl);
  }

  // GET /orders/:id
  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  createDraft(input: {
    customerName: string;
    items: { productId: string; qty: number }[];
  }): Observable<Order> {
    const payload = parseOrThrow(orderDraftSchema, input);
    return this.http.post<Order>(this.baseUrl, payload).pipe(
      tap(order => {
        this._orders$.next([order, ...this.snapshot]);
      })
    );
  }

  // POST /orders/:id/confirm
  confirm(id: string): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/${id}/confirm`, {}).pipe(
      tap(order => {
        const next = this.snapshot.map(o => (o.id === id ? order : o));
        this._orders$.next(next);
      })
    );
  }

  refresh(): Observable<Order[]> {
    return this.list().pipe(
      tap(orders => {
        this._orders$.next(orders);
      })
    );
  }
}
