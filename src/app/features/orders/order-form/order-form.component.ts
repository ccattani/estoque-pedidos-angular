import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { OrdersService } from '../../../core/services/orders.service';
import { Produto } from '../../../core/models/produto.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss',
})
export class OrderFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  private ordersService = inject(OrdersService);

  products = signal<Produto[]>(this.productsService.snapshot);
  error = signal('');

  form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    items: this.fb.array([] as any[]),
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  total = computed(() => {
    let sum = 0;
    for (const g of this.items.controls) {
      const qty = Number(g.get('qty')?.value ?? 0);
      const unitPrice = Number(g.get('unitPrice')?.value ?? 0);
      sum += qty * unitPrice;
    }
    return sum;
  });

  constructor() {
    this.productsService.products$.subscribe(ps => this.products.set(ps));
    this.addItem(); // começa com 1 linha
  }

  addItem() {
    const first = this.products()[0];
    this.items.push(
      this.fb.nonNullable.group({
        productId: [first?.id ?? '', [Validators.required]],
        qty: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [first?.price ?? 0, [Validators.required, Validators.min(0.01)]],
      })
    );
  }

  removeItem(i: number) {
    this.items.removeAt(i);
  }

  onProductChange(i: number) {
    const group = this.items.at(i);
    const productId = group.get('productId')?.value;
    const p = this.products().find(x => x.id === productId);
    if (p) group.get('unitPrice')?.setValue(p.price);
  }

  saveDraft() {
    this.error.set('');

    if (this.form.invalid || this.items.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    try {
      const order = this.ordersService.createDraft({
        customerName: v.customerName,
        items: v.items.map((it: any) => ({ productId: it.productId, qty: Number(it.qty) })),
      });
      this.router.navigate(['/orders', order.id]);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Erro ao criar pedido.');
    }
  }
}
