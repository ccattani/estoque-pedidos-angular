import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private products = inject(ProductsService);

  id = this.route.snapshot.paramMap.get('id'); // null => create
  isEdit = computed(() => !!this.id);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    sku: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stockCurrent: [0, [Validators.required, Validators.min(0)]],
    stockMin: [0, [Validators.required, Validators.min(0)]],
    active: [true, [Validators.required]],
  });

  error = '';

  constructor() {
    if (this.id) {
      const p = this.products.getById(this.id);
      if (!p) {
        this.error = 'Produto não encontrado.';
        return;
      }
      this.form.patchValue({
        name: p.name,
        sku: p.sku,
        price: p.price,
        stockCurrent: p.stockCurrent,
        stockMin: p.stockMin,
        active: p.active,
      });
    }
  }

  save() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    try {
      if (!this.id) {
        this.products.create(value);
      } else {
        this.products.update(this.id, value);
      }
      this.router.navigateByUrl('/products');
    } catch (e: any) {
      this.error = e?.message ?? 'Erro ao salvar.';
    }
  }
}
