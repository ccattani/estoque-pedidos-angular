import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "dashboard" },

  {
    path: "",
    loadComponent: () =>
      import("./shared/layout/layout.component").then((m) => m.LayoutComponent),
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: "products",
        loadComponent: () =>
          import(
            "./features/products/products-list/products-list.component"
          ).then((m) => m.ProductsListComponent),
      },
      {
        path: "orders",
        loadComponent: () =>
          import("./features/orders/orders-list/orders-list.component").then(
            (m) => m.OrdersListComponent
          ),
      },
      {
        path: "orders/new",
        loadComponent: () =>
          import("./features/orders/order-form/order-form.component").then(
            (m) => m.OrderFormComponent
          ),
      },
      {
        path: "orders/:id",
        loadComponent: () =>
          import("./features/orders/order-details/order-details.component").then(
            (m) => m.OrderDetailsComponent
          ),
      },
      {
        path: "inventory/movements",
        loadComponent: () =>
          import(
            "./features/inventory/movements-list/movements-list.component"
          ).then((m) => m.MovementsListComponent),
      },
    ],
  },

  {
    path: "products/new",
    loadComponent: () =>
      import("./features/products/product-form/product-form.component").then(
        (m) => m.ProductFormComponent
      ),
  },
  {
    path: "products/:id",
    loadComponent: () =>
      import("./features/products/product-form/product-form.component").then(
        (m) => m.ProductFormComponent
      ),
  },



  { path: "**", redirectTo: "dashboard" },
];
