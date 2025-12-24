import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { OrdersService } from "../../../core/services/orders.service";
import { ProductsService } from "../../../core/services/products.service";
import { ToastService } from "../../../core/services/toast.service";

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

  order = computed(() => this.orders.getById(this.id));
  productsMap = computed(() => {
    const map = new Map<string, string>();
    for (const p of this.products.snapshot) map.set(p.id, p.name);
    return map;
  });

  confirm() {
    this.error = "";
    try {
      this.orders.setStatus(this.id, "CONFIRMED");
      this.toast.show(
        "Pedido confirmado. Estoque baixado com sucesso.",
        "success"
      );
      this.router.navigate(["/orders"]);
    } catch (e) {
      const msg = (e as Error)?.message ?? "Erro ao confirmar.";
      this.error = msg;
      this.toast.show(msg, "error");
    }
  }
}
