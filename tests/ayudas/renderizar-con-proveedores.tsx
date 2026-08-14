import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";

/**
 * `rutaPatron` es necesario para probar paginas que leen useParams (por
 * ejemplo "/servicios/:idServicio"): sin una Route real que haga el match,
 * useParams siempre devuelve un objeto vacio.
 */
export function renderizarConProveedores(
  ui: ReactElement,
  opciones: { rutaInicial?: string; rutaPatron?: string } = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const contenido = opciones.rutaPatron ? (
    <Routes>
      <Route path={opciones.rutaPatron} element={ui} />
    </Routes>
  ) : (
    ui
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[opciones.rutaInicial ?? "/"]}>{contenido}</MemoryRouter>
    </QueryClientProvider>
  );
}
