# Plan de desarrollo — DevOpsEdu Frontend

> Este documento es la fuente de continuidad del proyecto: si se pierde el contexto de una sesión de Claude Code, o el trabajo se retoma desde otra cuenta, alcanza con leer este archivo (y los que enlaza) para continuar exactamente donde se dejó. Se actualiza al cierre de cada etapa o hito relevante. El historial de `git log` es siempre la fuente de verdad final si esta tabla queda desactualizada.

## Estado actual

| Etapa | Estado | Commit(s) |
| --- | --- | --- |
| Documentación base (`CLAUDE.md`, `.claude/skills`, documento de diseño, `docs/contrato-api.md`) | Completa | `db8818f` |
| Etapa 0 — Scaffolding del proyecto | Completa | `0f54ff4` |
| Etapa 1 — Módulo Sesión (login, registro, perfil) | Completa | `9b2a862` |
| Etapa 2 — Módulo Servicios | Completa | `83ffcd4` |
| Mejora transversal — Navegación y panel principal (RNF-03) | Completa | `dec4ebc` |
| Etapa 3 — Módulo Monitoreo | Siguiente paso | — |
| Etapa 4 — Módulo Aprendizaje | Pendiente (backend no implementado) | — |
| Etapa 5 — Módulo Administración | Pendiente (backend no implementado) | — |

**Próximo paso concreto:** Etapa 3 — Módulo Monitoreo. Primero decidir y documentar como `DT-06` la arquitectura del "Histórico de operaciones" (RF-15, CU-09; ver la nota en la sección de la Etapa 3 más abajo — es muy probable que se resuelva reutilizando la sección de histórico ya construida en `detalle-servicio.page.tsx` de la Etapa 2). Luego, escribir primero la prueba (RED) para las gráficas de métricas (RF-18, RF-19, `GET /api/servicios/:idServicio/metricas`), siguiendo `.claude/skills/ciclo-tdd` y `.claude/skills/nueva-vista-react`, antes de escribir el componente. Recharts (ya en `package.json`) es la biblioteca de gráficas definida en `CLAUDE.md`. La vista de gráficas de métricas debe registrarse dentro del bloque `DisenoAutenticado` en `rutas.tsx` (ver la mejora transversal de navegación) y agregarse a la lista `ENLACES` de `src/componentes-comunes/barra-navegacion.tsx` para que aparezca en el menú lateral.

## Cómo retomar el trabajo en una sesión nueva

1. Leer este archivo completo.
2. Leer `CLAUDE.md` (convenciones obligatorias del proyecto) y los tres skills en `.claude/skills/` (`ciclo-tdd`, `nueva-vista-react`, `trazabilidad-requerimientos`).
3. Leer `docs/contrato-api.md` (contrato real de la API — fuente autoritativa para los grupos `/api/auth`, `/api/servicios`, `/api/servidor`) y `docs/decisiones-tecnicas.md` (decisiones `DT-XX` ya tomadas, con su justificación).
4. Correr `git log --oneline` para confirmar el último commit real.
5. Correr `npm install && npm test && npm run build` para confirmar que el repo sigue en verde antes de seguir agregando código.
6. Continuar con la etapa marcada como "Siguiente paso" en la tabla de arriba, o la primera marcada como "Pendiente" si esta tabla no se actualizó.

---

## Contexto

El repositorio `devopsedu-frontend` partió vacío, con solo `CLAUDE.md` y `.claude/skills/`. Durante la sesión de planificación se incorporaron dos fuentes adicionales:

1. El documento de diseño técnico completo (`.claude/Proyecto de Julian Barrera v1.13.md`), del que se extrajo el catálogo de RF-01 a RF-26 y RNF-01 a RNF-25, la especificación de 6 de los 16 casos de uso, el diagrama de estados del `Servicio` (7 estados), el diagrama de componentes (interfaz `IRestAPI` conceptual) y el modelo de datos.
2. **`docs/contrato-api.md`** — el contrato real de la API del backend (`devopsedu-backend`, rama `segunda-semana`, commit `04f88c2`). Este documento **reemplaza cualquier inferencia** hecha a partir del documento de diseño para los grupos ya implementados: `/api/auth`, `/api/servicios`, `/api/servidor`. Es la fuente autoritativa para el cliente HTTP, los hooks de TanStack Query y los mocks de MSW de esos tres módulos.

**Hallazgo clave del contrato de API:** el backend **solo tiene implementados** los grupos de Sesión (`/api/auth`), Servicios (`/api/servicios`) y Recursos del servidor (`/api/servidor`). Los grupos `/api/aprendizaje`, `/api/modulos`, `/api/rutas` y `/api/reportes` (Aprendizaje y Administración, RF-20 a RF-26) **no existen todavía en el backend**. Por eso las Etapas 1-3 pueden construirse totalmente integradas contra el backend real, mientras que las Etapas 4-5 solo pueden construirse contra mocks especulativos, documentados como dependientes de trabajo futuro del backend.

**Discrepancia resuelta:** el mockup "Vista 02 — Registro" muestra un campo **ROL (selector)**, pero el contrato de API confirma que **el rol no se acepta desde el cliente** — el backend siempre asigna `estudiante` en el registro. Decisión tomada: omitir el campo en la implementación real (documentado como `DT-01` en `docs/decisiones-tecnicas.md`, junto con el resto de decisiones técnicas registradas hasta ahora).

El plan se organiza en 6 etapas: scaffolding (Etapa 0) + una etapa por cada uno de los 5 módulos de interfaz de `CLAUDE.md`. Cada etapa sigue el flujo TDD del skill `ciclo-tdd` y el procedimiento del skill `nueva-vista-react`; cada commit sigue el formato del skill `trazabilidad-requerimientos`.

---

## Etapa 0 — Scaffolding del proyecto — COMPLETA (`0f54ff4`)

- [x] `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`.
- [x] `tailwind.config.ts` + `src/diseno/tokens.ts` + `src/diseno/tailwind-base.css`.
- [x] `index.html`, `src/main.tsx`, `src/App.tsx`.
- [x] `src/infraestructura/configuracion.ts` (lee `VITE_API_URL`, prefijo `/api`).
- [x] `src/infraestructura/cliente-http.ts` (Axios con interceptor de `Authorization: Bearer` y manejo de `401` — con prueba).
- [x] `src/infraestructura/errores-api.ts` (normaliza las 3 formas de error del contrato — con prueba).
- [x] `src/infraestructura/almacenamiento-sesion.ts`, `src/infraestructura/proveedor-query.tsx`.
- [x] `src/enrutamiento/rutas.tsx` con `GuardaAutenticacion` y `GuardaRol` (con pruebas).
- [x] `src/tipos/roles.ts` (ver `DT-01` en `docs/decisiones-tecnicas.md` sobre el id asumido para `docente`).
- [x] `tests/configuracion/setup.ts`, `tests/ayudas/renderizar-con-proveedores.tsx`, `tests/mocks/servidor.ts`, `tests/mocks/handlers.ts`.
- [x] `.env.example`, `.gitignore`, `README.md`, `docs/decisiones-tecnicas.md`.
- [x] Verificación: `npm install`, `npm run dev`, `npm test` (19 pruebas), `npm run test:coverage` (100% líneas/funciones/statements, 97.29% ramas), `npm run build`, `npm run lint` — todo en verde.

Dos bugs de configuración corregidos durante la verificación (documentados en el commit): el alias `"@/"` de `vitest.config.ts` perdía la barra final por `path.resolve()`, y React Testing Library no limpiaba el DOM entre pruebas por tener `globals: false` en Vitest (se agregó `afterEach(() => cleanup())` explícito en `tests/configuracion/setup.ts`).

---

## Etapa 1 — Módulo Sesión (RF-01 a RF-04, CU-01, CU-02) — COMPLETA (`9b2a862`)

Grupo de API: `/api/auth` (contrato sección 2), sin autenticación previa requerida en ninguna de sus 3 rutas.

- [x] **Iniciar sesión** (`src/modulos/sesion/paginas/iniciar-sesion.page.tsx` + `src/modulos/sesion/hooks/use-iniciar-sesion.ts`) — `POST /api/auth/login`. Campos del mockup Vista 01: correo institucional, contraseña, "recordar sesión" (con efecto real en el almacenamiento, ver `DT-02`), enlace a registro. Validación con Zod + React Hook Form (`mode: onBlur`, `reValidateMode: onChange`). Error `401` mostrado como mensaje genérico bajo el formulario.
- [x] **Registro** (`src/modulos/sesion/paginas/registro.page.tsx` + `src/modulos/sesion/hooks/use-registro.ts`) — `POST /api/auth/registro`. **Sin campo de rol** (ver `DT-01`). Éxito `201` muestra una confirmación con enlace a iniciar sesión (el backend no emite token en el registro). Errores `400` mapeados campo por campo vía `detalles`, `409` (correo ya registrado) mostrado como mensaje genérico.
- [x] **Perfil / cerrar sesión** (`src/modulos/sesion/paginas/perfil.page.tsx` + `src/modulos/sesion/hooks/use-cerrar-sesion.ts`) — `POST /api/auth/logout`. Solo muestra los datos de `usuario` ya disponibles en la sesión y el botón de cerrar sesión; RF-04 (edición) queda pendiente del backend, ver `DT-03`.
- [x] `GuardaAutenticacion` registrado en `src/enrutamiento/rutas.tsx`: `/iniciar-sesion` y `/registro` públicas, `/perfil` protegida. `GuardaRol` se activará al proteger las rutas de Servicios en la Etapa 2.
- [x] Handlers de MSW por defecto en `tests/mocks/handlers.ts` para `/api/auth/login`, `/api/auth/registro`, `/api/auth/logout` (los tests de casos particulares los sobrescriben con `servidorMock.use()`).
- [x] Componentes comunes nuevos, requeridos por CLAUDE.md antes de construir formularios: `src/componentes-comunes/campo-texto.tsx`, `boton.tsx`, `casilla-verificacion.tsx`.
- [x] `src/infraestructura/almacenamiento-sesion.ts` extendido con el parámetro `persistente` (ver `DT-02`).
- [x] Verificación: `npm test` (47 pruebas unitarias + integración), `npm run test:coverage` (100% líneas/funciones/statements, 97% ramas), `npm run build`, `npm run lint` — todo en verde.
- [x] Verificación manual con `npm run dev` contra el backend real en `http://localhost:3000`: login y registro confirmados por el usuario. Se detectó y corrigió en el backend un problema de CORS (no tenía el middleware configurado) que bloqueaba las peticiones del navegador; no requirió cambios en este repositorio, ya que el cliente HTTP ya apuntaba a la ruta correcta (`/api/auth/...`) según `docs/contrato-api.md`.

---

## Etapa 2 — Módulo Servicios (RF-05 a RF-09, RF-11 a RF-14, RF-16 a RF-18, CU-03, CU-05, CU-06) — COMPLETA (`83ffcd4`)

Grupo de API: `/api/servicios` (contrato sección 3) — todas las rutas requieren `Bearer` + rol `estudiante` o `docente`; los recursos son siempre del usuario autenticado (acceder a un servicio ajeno responde `404`).

- [x] **Panel de servicios activos** (`src/modulos/servicios/paginas/panel-servicios.page.tsx`, ruta `/servicios`) — RF-16, CU-08. `GET /api/servicios`. Usa `TarjetaServicio` (nueva, `src/modulos/servicios/componentes/`) con `InsigniaEstado`. Estados de carga, vacío y error cubiertos.
- [x] **Crear servicio (asistente)** (`crear-servicio.page.tsx`, ruta `/servicios/nuevo`) — RF-05, RF-06, RF-07, RF-09, CU-03. `GET /api/servicios/imagenes` sugerido vía `<datalist>` (el usuario puede escribir otra imagen) + `POST /api/servicios`. Errores `422 RecursosInsuficientesError` muestran `solicitado` vs. `disponible`; `400` mapeado campo por campo. **No expone edición de puertos, variables de entorno ni volúmenes** (se envían vacíos, válido según el contrato) — ver `DT-04`. Redirige al detalle del servicio creado.
- [x] **Detalle de servicio** (`detalle-servicio.page.tsx`, ruta `/servicios/:idServicio`) — RF-17, RF-12 a RF-14, RNF-04, CU-05, CU-06. `GET /api/servicios/:idServicio` (incluye `registros`, listados como histórico). Acciones desplegar/detener/reiniciar y `BotonAccionCritica` (nuevo, con diálogo Radix) para eliminar. Los botones se **deshabilitan** según `ESTADOS_ORIGEN_VALIDOS` (`src/tipos/servicio.ts`, tabla de la sección 3.9 del contrato) en vez de esperar el `409`.
- [x] **Capacidad del servidor** (`capacidad-servidor.page.tsx`, ruta `/capacidad-servidor`) — RF-10, CU-04. `GET /api/servidor/capacidad`. Solo requiere autenticación, sin `GuardaRol` (el contrato no restringe por rol este endpoint). Usa `MedidorCapacidad` (nuevo, elemento `<progress>` nativo).
- [x] Componentes comunes nuevos: `insignia-estado.tsx` (7 estados), `medidor-capacidad.tsx`, `boton-accion-critica.tsx` (diálogo de confirmación destructiva con Radix Dialog); se agregó la variante `peligro` a `boton.tsx`.
- [x] `GuardaRol` activado en `src/enrutamiento/rutas.tsx` para `/servicios`, `/servicios/nuevo` y `/servicios/:idServicio` (roles `estudiante`/`docente`, ver `DT-01`).
- [x] Handlers de MSW por defecto en `tests/mocks/handlers.ts` para `/api/servicios`, `/api/servicios/imagenes`, `/api/servicios/:idServicio` (+ acciones), `/api/servidor/capacidad`.
- [x] `tests/ayudas/renderizar-con-proveedores.tsx` extendido con la opción `rutaPatron`, necesaria para probar páginas que leen `useParams` (ninguna vista de la Etapa 1 lo necesitaba).
- [x] Verificación: `npm test` (78 pruebas unitarias + integración), `npm run test:coverage` (99% líneas/statements, 93% ramas, 97% funciones), `npm run build`, `npm run lint` — todo en verde.
- [x] Verificación manual con `npm run dev` contra el backend real: panel de servicios, detalle (con histórico e imagen no disponible mostrando el error real del backend), crear servicio y capacidad del servidor confirmados por el usuario con capturas de pantalla.

---

## Mejora transversal — Navegación y panel principal (RNF-03) — COMPLETA (`dec4ebc`)

No es una etapa del plan original: se agregó tras la verificación manual de la Etapa 2, cuando el usuario notó que las vistas autenticadas no tenían ninguna forma de navegar entre ellas. El documento de diseño técnico ya lo definía (ver `DT-05` en `docs/decisiones-tecnicas.md`), pero no se había convertido en tarea explícita del plan.

- [x] `src/componentes-comunes/barra-navegacion.tsx` (`BarraNavegacion`) — barra superior (marca + usuario autenticado) y menú lateral con `NavLink`, resaltando la sección activa vía `aria-current="page"`.
- [x] `src/enrutamiento/diseno-autenticado.tsx` (`DisenoAutenticado`) — compone `BarraNavegacion` con `<Outlet/>`; anidado dentro de `GuardaAutenticacion` en `rutas.tsx`, envuelve **todas** las rutas autenticadas.
- [x] `src/modulos/principal/paginas/panel-principal.page.tsx` (`PanelPrincipalPage`) — hub principal en la ruta raíz `/`, que pasó de pública a protegida por `GuardaAutenticacion`. Saluda al usuario y ofrece accesos rápidos a Mis servicios, Crear servicio y Capacidad del servidor.
- [x] `rutas.tsx` reestructurado: `/`, `/perfil`, `/capacidad-servidor` y el bloque de `/servicios/*` (con `GuardaRol`) ahora viven anidados bajo `DisenoAutenticado`.
- [x] Pruebas existentes actualizadas por el cambio de comportamiento de `/` (ahora protegida): `tests/unitarias/app/app.test.tsx`, `tests/unitarias/enrutamiento/rutas.test.tsx`, `tests/integracion/modulos/sesion/flujo-perfil-y-logout.test.tsx`.
- [x] Verificación: `npm test` (88 pruebas unitarias + integración), `npm run test:coverage` (99% líneas/statements, 92% ramas, 97% funciones), `npm run build`, `npm run lint` — todo en verde.

El menú lateral (`ENLACES` en `barra-navegacion.tsx`) solo enlaza a las áreas ya implementadas. Cada etapa nueva que agregue una vista autenticada debe: (1) registrarla dentro del bloque `DisenoAutenticado` en `rutas.tsx`, y (2) agregar su entrada a `ENLACES` para que aparezca en el menú lateral.

---

## Etapa 3 — Módulo Monitoreo (RF-15, RF-18, RF-19, CU-09) — PENDIENTE

- [ ] Decidir y documentar como `DT-06` la arquitectura de "Histórico de operaciones" (RF-15, CU-09): no existe `GET /api/historico` global, solo `registros` anidados en `GET /api/servicios/:idServicio`. Confirmar con el usuario si se compone desde múltiples llamadas o se reutiliza la sección ya presente en el Detalle de servicio de la Etapa 2 (`detalle-servicio.page.tsx`, sección "Histórico de operaciones").
- [ ] **Gráficas de métricas** — RF-18, RF-19. `GET /api/servicios/:idServicio/metricas` con `desde`/`hasta` opcionales. Contemplar en `errores-api.ts` la tercera forma de error (`400` de query sin `detalles`). Sin WebSockets: usar `refetchInterval` de TanStack Query para la actualización automática.

---

## Etapa 4 — Módulo Aprendizaje (RF-22 a RF-24, CU-12 a CU-14) — PENDIENTE (backend no implementado)

El backend no implementa todavía `/api/aprendizaje/*` (sección 6 del contrato). Construir contra mocks de MSW, documentando el contrato asumido como `DT-07`, sin considerar la integración completa hasta que el backend entregue el grupo.

- [ ] **Mi ruta** — RF-22, CU-13.
- [ ] **Actividad** — RF-23, CU-12.
- [ ] **Evaluación** — RF-24, CU-14 (mockup Vista 12).

---

## Etapa 5 — Módulo Administración (RF-20, RF-21, RF-25, RF-26, CU-10, CU-11, CU-15, CU-16) — PENDIENTE (backend no implementado)

El backend no implementa todavía `/api/modulos`, `/api/rutas`, `/api/reportes`. Mismo tratamiento que la Etapa 4, contrato asumido documentado como `DT-08`.

- [ ] **Gestión de módulos** — RF-20, CU-10.
- [ ] **Asignación de rutas** — RF-21, CU-11.
- [ ] **Reportes** — RF-25, CU-15 (modo lectura también para investigador).
- [ ] **Exportación** — RF-26, CU-16.

---

## Verificación end-to-end del plan (aplica a cada etapa)

- `npm test` pasa completo y `npm run test:coverage` no cae de los umbrales (75/75/70/75).
- Cada vista nueva se verifica manualmente con `npm run dev` (contra backend real en Etapas 1-3, contra MSW en Etapas 4-5).
- `npm run build` sin errores de TypeScript estricto.
- Cada commit sigue el formato de `trazabilidad-requerimientos`; cada archivo de vista/prueba lleva cabecera con RF/CU.
- Las decisiones técnicas nuevas (`DT-02` en adelante) se registran en `docs/decisiones-tecnicas.md` antes de cerrar la etapa correspondiente, y este archivo (`docs/plan-de-desarrollo.md`) se actualiza marcando lo completado y moviendo el "Próximo paso concreto".
