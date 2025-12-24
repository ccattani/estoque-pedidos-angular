import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { ProductsService } from '../../../core/services/products.service';
import { Produto } from '../../../core/models/produto.model';
import { Movement, MovementType } from '../../../core/models/movement.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-movements-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movements-list.component.html',
  styleUrl: './movements-list.component.scss',
})
export class MovementsListComponent {
  private fb = inject(FormBuilder);
  private inventory = inject(InventoryService);
  private productsService = inject(ProductsService);
  private toast = inject(ToastService);

  products = signal<Produto[]>(this.productsService.snapshot);
  movements = signal<Movement[]>([]);
  showForm = signal(false);

  productsMap = computed(() => {
    const map = new Map<string, Produto>();
    for (const p of this.products()) map.set(p.id, p);
    return map;
  });

  form = this.fb.nonNullable.group({
    productId: ['', [Validators.required]],
    type: ['IN' as MovementType, [Validators.required]],
    qty: [1, [Validators.required, Validators.min(0)]],
    reason: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor() {
    this.productsService.products$.subscribe(ps => {
      this.products.set(ps);
      // se não tiver produto selecionado, seta o primeiro
      if (!this.form.controls.productId.value && ps.length) {
        this.form.controls.productId.setValue(ps[0].id);
      }
    });

    this.inventory.movements$.subscribe(ms => this.movements.set(ms));
  }

  open() {
    this.showForm.set(true);
  }

  close() {
    this.showForm.set(false);
    this.form.reset({
      productId: this.products()[0]?.id ?? '',
      type: 'IN',
      qty: 1,
      reason: '',
    });
  }

  badgeClass(t: MovementType) {
    return t.toLowerCase(); // in/out/adjust
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    // regra: ADJUST interpreta qty como "novo estoque"
    // regra: IN/OUT qty precisa ser >= 1 (não faz sentido 0)
    if (v.type !== 'ADJUST' && v.qty < 1) {
      this.toast.show('Quantidade deve ser >= 1 para IN/OUT.', 'error');
      return;
    }

    try {
      this.inventory.register({
        productId: v.productId,
        type: v.type,
        qty: Number(v.qty),
        reason: v.reason.trim(),
      });

      const p = this.productsMap().get(v.productId);
      const name = p?.name ?? 'Produto';

      const msg =
        v.type === 'IN'
          ? `Entrada registrada para ${name}.`
          : v.type === 'OUT'
          ? `Saída registrada para ${name}.`
          : `Estoque ajustado para ${name}.`;

      this.toast.show(msg, 'success');
      this.close();
    } catch (e: any) {
      this.toast.show(e?.message ?? 'Erro ao registrar movimentação.', 'error');
    }
  }
}
