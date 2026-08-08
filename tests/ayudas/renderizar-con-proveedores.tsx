import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";

export function renderizarConProveedores(
  ui: ReactElement,
  opciones: { rutaInicial?: string } = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[opciones.rutaInicial ?? "/"]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}
