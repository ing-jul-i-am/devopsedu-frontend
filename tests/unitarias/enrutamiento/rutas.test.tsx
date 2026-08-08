/**
 * Cubre: RF-02, RF-04 — proteccion de rutas segun sesion activa (GuardaAutenticacion)
 * y segun rol del usuario (GuardaRol).
 */
import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { GuardaAutenticacion, GuardaRol, Rutas } from "@/enrutamiento/rutas";
import { guardarSesion, limpiarSesion } from "@/infraestructura/almacenamiento-sesion";
import { ID_ROL_DOCENTE, ID_ROL_ESTUDIANTE } from "@/tipos/roles";

function renderizarConGuardaAutenticacion(rutaInicial: string) {
  return render(
    <MemoryRouter initialEntries={[rutaInicial]}>
      <Routes>
        <Route element={<GuardaAutenticacion />}>
          <Route path="/protegida" element={<p>Contenido protegido</p>} />
        </Route>
        <Route path="/iniciar-sesion" element={<p>Formulario de inicio de sesion</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function renderizarConGuardaRol(rolesPermitidos: number[]) {
  return render(
    <MemoryRouter initialEntries={["/administracion"]}>
      <Routes>
        <Route element={<GuardaRol rolesPermitidos={rolesPermitidos} />}>
          <Route path="/administracion" element={<p>Panel administrativo</p>} />
        </Route>
        <Route path="/" element={<p>Panel principal</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("GuardaAutenticacion", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("redirige a inicio de sesion cuando no hay sesion activa", () => {
    renderizarConGuardaAutenticacion("/protegida");

    expect(screen.getByText(/formulario de inicio de sesion/i)).toBeInTheDocument();
  });

  it("muestra el contenido protegido cuando existe una sesion activa", () => {
    guardarSesion("token-de-prueba", {
      idUsuario: 1,
      nombre: "Estudiante de prueba",
      correo: "estudiante@devopsedu.local",
      fechaRegistro: "2026-08-07T00:00:00.000Z",
      idRol: ID_ROL_ESTUDIANTE,
    });

    renderizarConGuardaAutenticacion("/protegida");

    expect(screen.getByText(/contenido protegido/i)).toBeInTheDocument();
  });
});

describe("GuardaRol", () => {
  afterEach(() => {
    limpiarSesion();
  });

  it("redirige al panel principal cuando el rol del usuario no esta permitido", () => {
    guardarSesion("token-de-prueba", {
      idUsuario: 1,
      nombre: "Estudiante de prueba",
      correo: "estudiante@devopsedu.local",
      fechaRegistro: "2026-08-07T00:00:00.000Z",
      idRol: ID_ROL_ESTUDIANTE,
    });

    renderizarConGuardaRol([ID_ROL_DOCENTE]);

    expect(screen.getByText(/panel principal/i)).toBeInTheDocument();
  });

  it("redirige al panel principal cuando no hay sesion activa", () => {
    renderizarConGuardaRol([ID_ROL_DOCENTE]);

    expect(screen.getByText(/panel principal/i)).toBeInTheDocument();
  });

  it("muestra el contenido cuando el rol del usuario esta permitido", () => {
    guardarSesion("token-de-prueba", {
      idUsuario: 2,
      nombre: "Docente de prueba",
      correo: "docente@devopsedu.local",
      fechaRegistro: "2026-08-07T00:00:00.000Z",
      idRol: ID_ROL_DOCENTE,
    });

    renderizarConGuardaRol([ID_ROL_DOCENTE]);

    expect(screen.getByText(/panel administrativo/i)).toBeInTheDocument();
  });
});

describe("Rutas", () => {
  it("muestra la pagina de inicio en la ruta raiz", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Rutas />
      </MemoryRouter>
    );

    expect(screen.getByText("DevOpsEdu")).toBeInTheDocument();
  });
});
