import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

/**
 * Todas las respuestas de error del backend (docs/contrato-api.md seccion 1.3)
 * son definitivas, no transitorias: un 404/409/422/etc. no se resuelve
 * reintentando la misma peticion. Reintentar (el comportamiento por defecto de
 * TanStack Query, hasta 3 veces con backoff) solo retrasa varios segundos que
 * la UI muestre el mensaje de error real (RNF-02).
 */
export function ProveedorQuery({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
