---
name: nueva-vista-react
description: "Usa este skill cuando se solicite crear una pantalla, pagina, vista, o componente principal del frontend de DevOpsEdu. Tambien aplica con frases como 'agrega la vista de X', 'crea la pantalla de monitoreo', 'haz la pagina de Y', 'implementa el formulario Z'. Cubre el procedimiento completo con TDD: prueba primero, ubicacion en el modulo correcto, uso del sistema de diseño, validaciones de formulario, accesibilidad WCAG AA, integracion con el backend mediante TanStack Query, mocks de HTTP con MSW y trazabilidad con RF/CU. Aplicalo SIEMPRE que vayas a crear un archivo en src/modulos/*/paginas/. Lee primero el skill 'ciclo-tdd' si aun no lo has leido en esta sesion."
---

# Skill: crear una nueva vista en el frontend de DevOpsEdu (TDD)

Este skill define el procedimiento obligatorio para agregar una vista respetando la estructura por módulos, el sistema de diseño, los requerimientos no funcionales y la metodología TDD. **Antes de seguirlo, lee el skill `ciclo-tdd`.**

## 1. Ubica la vista en el módulo correcto

El frontend tiene cinco módulos (sección 4.2.15): `sesion`, `servicios`, `monitoreo`, `aprendizaje`, `administracion`. Revisa la tabla de mapeo en `CLAUDE.md`. Si la vista no encaja, consulta al desarrollador.

## 2. Identifica los requerimientos cubiertos

- RF que satisface.
- CU del que es parte.
- Rol que puede acceder.
- Si tiene acciones críticas que requieran confirmación (RNF-04).

## 3. Escribe primero las pruebas (RED)

Define el comportamiento esperado de la vista antes de implementarla. Ubicación: `tests/unitarias/modulos/<modulo>/paginas/<nombre>.test.tsx` para pruebas de componentes y `tests/integracion/modulos/<modulo>/<flujo>.test.tsx` para flujos completos.

### 3.1 Test de componente unitario

```tsx
// tests/unitarias/modulos/servicios/paginas/detalle-servicio.test.tsx
// Cubre: RF-12, RF-13, RF-14, RF-17 — CU-06, CU-07
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { renderizarConProveedores } from "../../../../ayudas/renderizar-con-proveedores";
import { DetalleServicioPage } from "@/modulos/servicios/paginas/detalle-servicio.page";
import { crearServicioDePrueba } from "../../../../fixtures/servicio.factory";

describe("DetalleServicioPage", () => {
  it("muestra los datos del servicio cuando la carga es exitosa", async () => {
    const servicio = crearServicioDePrueba({
      idServicio: 7,
      nombre: "postgres-clase-04",
      estado: "en_ejecucion",
    });

    servidorMock.use(
      http.get("/api/servicios/7", () => HttpResponse.json(servicio))
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
    });

    expect(await screen.findByText("postgres-clase-04")).toBeInTheDocument();
    expect(screen.getByText(/en ejecucion/i)).toBeInTheDocument();
  });

  it("muestra un indicador de carga inicial", () => {
    servidorMock.use(
      http.get("/api/servicios/7", async () => {
        await new Promise((r) => setTimeout(r, 200));
        return HttpResponse.json(crearServicioDePrueba({ idServicio: 7 }));
      })
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
    });

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
  });

  it("muestra un mensaje cuando el servicio no existe", async () => {
    servidorMock.use(
      http.get("/api/servicios/999", () =>
        HttpResponse.json({ mensaje: "No encontrado" }, { status: 404 })
      )
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/999",
    });

    expect(await screen.findByText(/servicio no encontrado/i)).toBeInTheDocument();
  });

  it("requiere confirmacion antes de eliminar el servicio", async () => {
    const usuario = userEvent.setup();
    const servicio = crearServicioDePrueba({ idServicio: 7, estado: "detenido" });
    servidorMock.use(
      http.get("/api/servicios/7", () => HttpResponse.json(servicio))
    );

    renderizarConProveedores(<DetalleServicioPage />, {
      rutaInicial: "/servicios/7",
    });

    await usuario.click(await screen.findByRole("button", { name: /eliminar servicio/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/esta accion no se puede deshacer/i)).toBeInTheDocument();
  });
});
```

Ejecuta `npm run test:watch`. Falla todo. Red.

### 3.2 Test de integración de flujo

Cuando el flujo cruza varios componentes o varias rutas, usa `tests/integracion/`:

```tsx
// tests/integracion/modulos/servicios/crear-y-ver-servicio.test.tsx
// Cubre: RF-05 a RF-08, RF-17 — CU-03
it("permite al estudiante crear un servicio y verlo en el panel", async () => {
  // ... mocks de MSW
  // ... navegar a /servicios/crear
  // ... llenar formulario
  // ... enviar
  // ... esperar redireccion a /servicios
  // ... verificar que aparece la tarjeta del nuevo servicio
});
```

## 4. Crea la página (GREEN)

Ubicación: `src/modulos/<modulo>/paginas/<nombre>.page.tsx`.

```tsx
// detalle-servicio.page.tsx
// Vista detallada de un servicio del estudiante.
// Cubre: RF-12, RF-13, RF-14, RF-17 — CU-06, CU-07
import { useParams } from "react-router-dom";
import { useServicio } from "../hooks/use-servicio";
import { BotonAccionCritica } from "@/componentes-comunes/boton-accion-critica";

export function DetalleServicioPage() {
  const { idServicio } = useParams<{ idServicio: string }>();
  const { data: servicio, isLoading, error } = useServicio(Number(idServicio));

  if (isLoading) {
    return <div role="status" aria-label="Cargando servicio">Cargando...</div>;
  }
  if (error || !servicio) {
    return <p>Servicio no encontrado</p>;
  }

  return (
    <article>
      <h1>{servicio.nombre}</h1>
      <span>{traducirEstado(servicio.estado)}</span>
      <BotonAccionCritica
        textoBoton="Eliminar servicio"
        tituloDialogo="Eliminar este servicio"
        descripcionDialogo="Se eliminara el contenedor y se liberaran los recursos asociados. Esta accion no se puede deshacer."
        textoConfirmacion="Eliminar"
        onConfirmar={() => { /* ... */ }}
      />
    </article>
  );
}
```

Reglas:

- Componente exportado como función `PascalCase` con sufijo `Page`.
- Archivo en `kebab-case` con sufijo `.page.tsx`.
- Lógica de datos en hooks bajo `hooks/`, no dentro de la página.
- La página orquesta componentes; sin marcado largo ni cálculos pesados.

## 5. Registra la ruta

En `src/enrutamiento/rutas.tsx`:

```tsx
<Route
  path="/servicios/:idServicio"
  element={
    <GuardaAutenticacion>
      <GuardaRol roles={["estudiante", "docente"]}>
        <DetalleServicioPage />
      </GuardaRol>
    </GuardaAutenticacion>
  }
/>
```

## 6. Componentes y hooks

Componentes específicos del módulo en `src/modulos/<modulo>/componentes/`. Componentes genéricos en `src/componentes-comunes/`. Antes de crear uno, verifica si ya existe similar.

Hooks de datos con TanStack Query:

```tsx
// src/modulos/servicios/hooks/use-servicio.ts
import { useQuery } from "@tanstack/react-query";
import { clienteHttp } from "@/infraestructura/cliente-http";

export function useServicio(idServicio: number) {
  return useQuery({
    queryKey: ["servicio", idServicio],
    queryFn: async () => {
      const { data } = await clienteHttp.get(`/api/servicios/${idServicio}`);
      return data;
    },
    refetchInterval: 5000,
  });
}
```

Cada hook tiene su prueba con `renderHook`:

```tsx
// tests/unitarias/modulos/servicios/hooks/use-servicio.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { servidorMock } from "../../../../mocks/servidor";
import { useServicio } from "@/modulos/servicios/hooks/use-servicio";
import { wrapperConQueryClient } from "../../../../ayudas/wrapper-query";

it("retorna los datos del servicio cuando el backend responde 200", async () => {
  servidorMock.use(
    http.get("/api/servicios/1", () => HttpResponse.json({ idServicio: 1, nombre: "x" }))
  );

  const { result } = renderHook(() => useServicio(1), { wrapper: wrapperConQueryClient() });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toMatchObject({ idServicio: 1, nombre: "x" });
});
```

## 7. Formularios con validación

- React Hook Form + Zod.
- `label` accesible, texto de ayuda, mensaje de error.
- Validación `onBlur` o `onChange` tras primer envío.
- Mensajes claros en español (RNF-02).

## 8. Acciones críticas con confirmación (RNF-04)

Toda acción irreversible usa `BotonAccionCritica` o equivalente.

## 9. Accesibilidad (RNF-05, WCAG AA)

- `label` asociada a cada control.
- Contraste verificado.
- Foco visible.
- Orden de tabulación lógico.
- `aria-live="polite"` en regiones dinámicas (monitoreo, mensajes).
- Iconos decorativos con `aria-hidden="true"`; informativos con `aria-label`.

Las pruebas validan accesibilidad usando `getByRole` y `getByLabelText` antes que `getByTestId`.

## 10. Estados visuales

Toda vista maneja:

- **Cargando**: indicador discreto que no desplace contenido.
- **Vacío**: mensaje claro con acción sugerida.
- **Error**: mensaje informativo con opción de reintentar.
- **Éxito**: contenido normal.

Cada estado debe estar cubierto por una prueba.

## 11. REFACTOR

Con pruebas verdes:

- Extrae subcomponentes si la página crece más de 150 líneas.
- Mueve estilos sueltos al sistema de diseño.
- Simplifica props.

## 12. Trazabilidad

- Cabecera del archivo con propósito y referencias RF/CU.
- Cabecera del archivo de prueba con las mismas referencias.
- Commit con formato del skill `trazabilidad-requerimientos`.

## Lista de verificación final

- [ ] Pruebas escritas primero (Red).
- [ ] La vista vive en el módulo correcto.
- [ ] Cabecera del archivo declara propósito y referencias RF/CU.
- [ ] Cabecera del archivo de prueba declara las mismas referencias.
- [ ] Ruta registrada con guardas de autenticación y rol apropiadas.
- [ ] Componentes provienen del sistema de diseño o están justificados.
- [ ] Colores, tamaños y espaciados desde el sistema de diseño.
- [ ] Formularios validan con Zod en español claro.
- [ ] Acciones críticas con diálogo de confirmación + su prueba.
- [ ] Tests usan selectores accesibles (`getByRole`, `getByLabelText`).
- [ ] Llamadas HTTP mockeadas con MSW.
- [ ] Estados de carga, vacío, error, éxito cubiertos con pruebas.
- [ ] Todas las pruebas pasan (`npm test`).
- [ ] Cobertura no cayó por debajo de los umbrales.
- [ ] Commit con referencia RF/CU.
