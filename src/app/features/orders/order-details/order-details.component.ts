import { Component, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { OrdersService } from "../../../core/services/orders.service";
import { ProductsService } from "../../../core/services/products.service";
import { ToastService } from "../../../core/services/toast.service";
import { Order } from "../../../core/models/pedido.model";
import { Produto } from "../../../core/models/produto.model";

@Component({
  selector: "app-order-details",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./order-details.component.html",
  styleUrl: "./order-details.component.scss",
})
export class OrderDetailsComponent {
  private route = inject(ActivatedRoute);
  private orders = inject(OrdersService);
  private products = inject(ProductsService);
  private toast = inject(ToastService);
  private router = inject(Router);

  id = this.route.snapshot.paramMap.get("id")!;
  error = "";

  order = signal<Order | null>(null);
  products = signal<Produto[]>([]);
  productsMap = computed(() => {
    const map = new Map<string, string>();
    for (const p of this.products()) map.set(p.id, p.name);
    return map;
  });

  constructor() {
    this.products.products$.subscribe(ps => this.products.set(ps));
    this.products.refresh().subscribe();

    this.orders.getById(this.id).subscribe({
      next: order => {
        this.order.set(order);
      },
      error: () => {
        this.error = "Pedido não encontrado.";
      },
    });
  }

  confirm() {
    this.error = "";
    this.orders.confirm(this.id).subscribe({
      next: order => {
        this.order.set(order);
        this.toast.show(
          "Pedido confirmado. Estoque baixado com sucesso.",
          "success"
        );
        this.router.navigate(["/orders"]);
      },
      error: (e: unknown) => {
        const msg = (e as Error)?.message ?? "Erro ao confirmar.";
        this.error = msg;
        this.toast.show(msg, "error");
      },
    });
  }
}
