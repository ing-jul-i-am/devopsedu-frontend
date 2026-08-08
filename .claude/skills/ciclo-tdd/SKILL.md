---
name: ciclo-tdd
description: "Skill obligatorio antes de escribir cualquier componente, hook o pagina nueva en el frontend. Define el flujo Red-Green-Refactor adaptado a React + Vitest + React Testing Library. Usalo cuando se te pida 'crea el componente X', 'agrega la vista Y', 'implementa el hook Z', 'haz el formulario W', o cualquier solicitud de nueva funcionalidad ANTES de escribir codigo de produccion. Tambien aplica al corregir bugs visuales o de comportamiento, donde la primera accion es escribir una prueba que reproduzca el defecto. Aplicalo SIEMPRE; los casos exceptuados estan en el CLAUDE.md seccion 7.2."
---

# Skill: ciclo TDD para frontend (Red-Green-Refactor)

Este skill define el flujo obligatorio para escribir código nuevo del frontend. TDD en frontend tiene un matiz importante: las pruebas describen lo que el usuario ve y hace, no la estructura interna del componente.

## El ciclo en tres pasos

**1. RED.** Escribe una prueba que describa lo que el usuario debe poder ver o hacer. La prueba debe fallar porque el componente o el comportamiento aún no existe.

**2. GREEN.** Implementa lo mínimo para que la prueba pase. Marcado y lógica suficientes, nada más.

**3. REFACTOR.** Mejora el código sin cambiar el comportamiento. Extrae subcomponentes, mueve estilos al sistema de diseño, simplifica props.

## Principio rector: probar comportamiento, no implementación

La pregunta correcta antes de escribir una prueba es: **¿qué espero que el usuario perciba o haga?** No: ¿qué función interna debería invocarse?

Bueno:

```tsx
it("muestra el mensaje de bienvenida con el nombre del usuario", () => {
  renderizarConProveedores(<PanelPrincipal usuario={{ nombre: "Julian" }} />);
  expect(screen.getByText(/bienvenido, julian/i)).toBeInTheDocument();
});
```

Malo (acoplado a la implementación):

```tsx
it("renderiza el componente MensajeBienvenida", () => {
  const { container } = renderizarConProveedores(<PanelPrincipal usuario={...} />);
  expect(container.querySelector(".mensaje-bienvenida")).not.toBeNull();
});
```

El primero sobrevive a un refactor; el segundo se rompe si se cambia el nombre de la clase.

## Aplicación práctica

### Ejemplo 1: componente con estados (TarjetaServicio)

**Ciclo 1 — RED:**

```tsx
// tests/unitarias/modulos/servicios/componentes/tarjeta-servicio.test.tsx
// Cubre: RF-16, RF-17 — CU-08
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { TarjetaServicio } from "@/modulos/servicios/componentes/tarjeta-servicio";
import { crearServicioDePrueba } from "../../../../fixtures/servicio.factory";

describe("TarjetaServicio", () => {
  it("muestra el nombre y el estado del servicio", () => {
    const servicio = crearServicioDePrueba({
      nombre: "postgres-clase-04",
      estado: "en_ejecucion",
    });

    renderizarConProveedores(<TarjetaServicio servicio={servicio} />);

    expect(screen.getByText("postgres-clase-04")).toBeInTheDocument();
    expect(screen.getByText(/en ejecucion/i)).toBeInTheDocument();
  });
});
```

El test falla porque el componente no existe. Red.

**Ciclo 1 — GREEN:**

```tsx
// src/modulos/servicios/componentes/tarjeta-servicio.tsx
// Cubre: RF-16, RF-17 — CU-08
import { Servicio } from "@/tipos/servicio";

interface Props {
  servicio: Servicio;
}

const ETIQUETAS_ESTADO: Record<string, string> = {
  configurado: "Configurado",
  desplegando: "Desplegando",
  en_ejecucion: "En ejecucion",
  detenido: "Detenido",
  reiniciando: "Reiniciando",
  fallido: "Fallido",
  eliminado: "Eliminado",
};

export function TarjetaServicio({ servicio }: Props) {
  return (
    <article>
      <h3>{servicio.nombre}</h3>
      <span>{ETIQUETAS_ESTADO[servicio.estado]}</span>
    </article>
  );
}
```

Verde.

**Ciclo 2 — RED:** agregar prueba para el botón de detener cuando el servicio está en ejecución.

```tsx
it("muestra el boton de detener cuando el servicio esta en ejecucion", () => {
  const servicio = crearServicioDePrueba({ estado: "en_ejecucion" });
  renderizarConProveedores(<TarjetaServicio servicio={servicio} />);
  expect(screen.getByRole("button", { name: /detener/i })).toBeInTheDocument();
});

it("no muestra el boton de detener cuando el servicio esta detenido", () => {
  const servicio = crearServicioDePrueba({ estado: "detenido" });
  renderizarConProveedores(<TarjetaServicio servicio={servicio} />);
  expect(screen.queryByRole("button", { name: /detener/i })).not.toBeInTheDocument();
});
```

**Ciclo 2 — GREEN:** agregar la condición y el botón.

**Ciclo 2 — REFACTOR:** las etiquetas de estado tienen suficiente lógica como para extraerse a un helper `obtenerEtiquetaEstado(estado)`. Los tests siguen pasando.

### Ejemplo 2: formulario con validación

**RED:**

```tsx
// tests/unitarias/modulos/sesion/componentes/formulario-login.test.tsx
// Cubre: RF-02, RNF-02 — CU-01
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { FormularioLogin } from "@/modulos/sesion/componentes/formulario-login";

describe("FormularioLogin", () => {
  it("muestra un mensaje de error cuando el correo no tiene formato valido", async () => {
    const usuario = userEvent.setup();
    renderizarConProveedores(<FormularioLogin />);

    await usuario.type(screen.getByLabelText(/correo/i), "no-es-correo");
    await usuario.tab();

    expect(await screen.findByText(/correo invalido/i)).toBeInTheDocument();
  });

  it("muestra un mensaje cuando la contrasena tiene menos de 8 caracteres", async () => {
    const usuario = userEvent.setup();
    renderizarConProveedores(<FormularioLogin />);

    await usuario.type(screen.getByLabelText(/contrase/i), "corta");
    await usuario.tab();

    expect(await screen.findByText(/al menos 8 caracteres/i)).toBeInTheDocument();
  });
});
```

**GREEN:** construye el formulario con React Hook Form + Zod, con los mensajes esperados.

**REFACTOR:** extrae el `Input` con su `label` y mensaje de error a `componentes-comunes/`.

### Ejemplo 3: flujo de integración con MSW

```tsx
// tests/integracion/modulos/sesion/flujo-login.test.tsx
// Cubre: RF-02 — CU-01
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../mocks/servidor";
import { renderizarConProveedores } from "../../../ayudas/renderizar-con-proveedores";
import { App } from "@/App";

describe("Flujo de inicio de sesion", () => {
  it("redirige al panel principal tras un login exitoso", async () => {
    servidorMock.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({
          token: "jwt-falso",
          usuario: { idUsuario: 1, nombre: "Julian", correo: "j@d.com", rol: "estudiante" },
        })
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<App />, { rutaInicial: "/iniciar-sesion" });

    await usuario.type(screen.getByLabelText(/correo/i), "j@d.com");
    await usuario.type(screen.getByLabelText(/contrase/i), "Clave_segura_1");
    await usuario.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/panel principal/i)).toBeInTheDocument();
  });

  it("muestra el mensaje de credenciales invalidas cuando el backend responde 401", async () => {
    servidorMock.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({ mensaje: "Credenciales invalidas" }, { status: 401 })
      )
    );

    const usuario = userEvent.setup();
    renderizarConProveedores(<App />, { rutaInicial: "/iniciar-sesion" });

    await usuario.type(screen.getByLabelText(/correo/i), "j@d.com");
    await usuario.type(screen.getByLabelText(/contrase/i), "Clave_segura_1");
    await usuario.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/credenciales invalidas/i)).toBeInTheDocument();
  });
});
```

## Selectores recomendados (en orden de preferencia)

1. `getByRole` — buscado por rol semántico, es lo que usan los lectores de pantalla.
2. `getByLabelText` — para campos de formulario.
3. `getByPlaceholderText` — solo si no hay label posible.
4. `getByText` — para texto visible.
5. `getByDisplayValue` — para campos con valor inicial.
6. `getByAltText` — para imágenes.
7. `getByTitle` — fallback.
8. `getByTestId` — **último recurso, solo cuando ninguno de los anteriores aplica**.

Si te ves obligado a usar `getByTestId`, considera si el componente es realmente accesible.

## Variantes find / get / query

- `getBy*` — debe existir; lanza error si no.
- `findBy*` — espera hasta que exista (asíncrono); para operaciones tras una acción del usuario.
- `queryBy*` — devuelve null si no existe; útil con `not.toBeInTheDocument()`.

## Errores comunes a evitar

- **No envolver acciones del usuario en `userEvent.setup()`**. Sin setup, los eventos no son realistas.
- **No usar `findBy*` cuando el cambio es asíncrono.** Si esperas un resultado tras una petición HTTP, debe ser `findBy*`, no `getBy*`.
- **No limpiar handlers de MSW entre tests.** Esto puede contaminar pruebas posteriores. La función `afterEach` en `setup.ts` ya hace `servidorMock.resetHandlers()`.
- **No envolver `userEvent.click` en `act`.** No es necesario en versiones modernas y oscurece el código.
- **No probar implementación.** Si un refactor que no cambia el comportamiento rompe la prueba, la prueba está mal.

## Lista de verificación antes de cerrar un ciclo

- [ ] Escribí la prueba primero (Red).
- [ ] La prueba fallaba antes de implementar.
- [ ] El componente o lógica mínima hace que pase (Green).
- [ ] Refactoricé sin romper pruebas.
- [ ] Las pruebas previas siguen verdes.
- [ ] Usé selectores accesibles (`getByRole`, `getByLabelText` antes que `getByTestId`).
- [ ] El test verifica comportamiento visible, no estructura interna.
- [ ] Las llamadas HTTP están mockeadas con MSW.
- [ ] Los datos vienen de factories en `tests/fixtures/`.
- [ ] El componente respeta el sistema de diseño y la accesibilidad WCAG AA.
