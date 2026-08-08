import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderizarConProveedores } from "../../ayudas/renderizar-con-proveedores";
import App from "@/App";

describe("App", () => {
  it("renderiza la pagina de inicio en la ruta raiz", () => {
    renderizarConProveedores(<App />);

    expect(screen.getByText("DevOpsEdu")).toBeInTheDocument();
  });
});
