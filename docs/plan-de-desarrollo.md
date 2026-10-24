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
| Etapa 3 — Módulo Monitoreo | Completa | `1e237f5` |
| Etapa 4 — Módulo Aprendizaje (estudiante) | Completa | `5d08be3`, `90417cb`, `14fb0e8` |
| Etapa 5 — Módulo Administración (módulos y estudiantes) | Completa | `5d08be3` |
| Mejora transversal — Configuración avanzada de servicios y nuevo ciclo de vida de contenedores (DT-13 a DT-16) | Completa | `d315318` |
| Mejora transversal — Estado visual de actividades, barra lateral por categorías y panel principal con datos (DT-17) | Completa | `5317f9f`, `29a626e`, `1373b2d`, `b39a284`, `2d57459` |
| Etapa 5b — Reportes, Exportación y listado de estudiantes (RF-25, CU-15, CU-16, DT-18 a DT-20) | Completa | `72a9287`, `5fc6c61`, `a42ceab`, `ed619bb` |

**Próximo paso concreto (actualizado 2026-10-23):** el backend completó su Etapa 7 (`/api/reportes` y `GET /api/usuarios/estudiantes`, secciones 7.2 y 8b de `docs/contrato-api.md`) y el frontend ya la integra en la Etapa 5b: vista de Reportes con exportación en CSV o PDF y selector de estudiantes en Gestión de estudiantes. Con esto, todo el catálogo de RF del diseño (RF-01 a RF-25; no existe RF-26) tiene su vista. La Etapa 5b quedó verificada manualmente por el usuario contra el backend real (2026-10-23). En el frontend no queda trabajo del catálogo pendiente; solo los puntos bloqueados por el backend y las mejoras opcionales de abajo.

Pendientes que siguen bloqueados por el backend: edición de perfil (RF-04, ver `DT-03`) y la comparación exacta de `imagenDocker` en la evaluación de actividades (ver `DT-14`). El listado de usuarios de `DT-09` ya está resuelto (`DT-20`).

**Integración en `main`:** todo el trabajo vive en la rama `cuarta-semana` (subida a `origin`); `main` solo contiene los tres primeros commits. Por decisión del usuario (2026-10-23), el PR de `cuarta-semana` a `main` se pospone hasta retomar el desarrollo con el backend listo.

Mejoras opcionales detectadas en las revisiones del 2026-10-10 y 2026-10-23, sin urgencia: alinear las vistas que todavía usan el estilo anterior a DT-17 (`panel-modulos.page.tsx`, `crear-modulo.page.tsx`, `editar-modulo.page.tsx`, `mi-ruta.page.tsx`, entre otras) con tarjetas y el encabezado del panel principal; el bundle de producción pesa ~1.5 MB (Vite advierte por superar 500 kB; candidatos a `React.lazy`: el editor TipTap y las gráficas de Recharts), React Router emite advertencias de las banderas `v7_startTransition` y `v7_relativeSplatPath` en las pruebas, y 44 archivos preexistentes no siguen el formato de Prettier (`npm run format` los corregiría en un commit `style` aparte).

**Hallazgos de la verificación manual (usuario, 2026-09-12) y su resolución:**

1. El enlace "Ver evaluación del módulo" aparecía siempre, incluso sin evaluación asignada, llevando a un error confuso — **corregido**: ahora se oculta solo cuando el backend responde `404` (no existe evaluación); sigue visible si responde `422` (existe pero aún no alcanza su `fechaDisponible`).
2. y 3. No había bloqueo secuencial entre módulos ni indicador visual de progreso por módulo en "Mi ruta" — **corregido**: el usuario agregó `estado` por módulo en `GET /api/aprendizaje/mi-ruta` (backend, `DT-13`; frontend, resolución registrada en `DT-11`). `mi-ruta.page.tsx` colorea cada módulo (verde/amarillo/gris) y reemplaza el enlace por un mensaje cuando el predecesor inmediato no está `completado`; `modulo-aprendizaje.page.tsx` repite la misma verificación para que el bloqueo no se evada escribiendo la URL directamente.
4. El reseteo de contraseña fallaba por CORS (`PATCH` no estaba en `Access-Control-Allow-Methods` de `devopsedu-backend/src/api/middlewares/cors.ts`) — **corregido por el usuario en su sesión del backend**, confirmado leyendo el archivo (ahora incluye `PATCH`).

Las cuatro correcciones fueron verificadas manualmente por el usuario contra el backend real (confirmado el 2026-10-10).

## Cómo retomar el trabajo en una sesión nueva

1. Leer este archivo completo.
2. Leer `CLAUDE.md` (convenciones obligatorias del proyecto) y los tres skills en `.claude/skills/` (`ciclo-tdd`, `nueva-vista-react`, `trazabilidad-requerimientos`).
3. Leer `docs/contrato-api.md` (contrato real de la API — fuente autoritativa para los grupos `/api/auth`, `/api/servicios`, `/api/servidor`, `/api/modulos`, `/api/rutas`, `/api/aprendizaje` y `/api/usuarios`) y `docs/decisiones-tecnicas.md` (decisiones `DT-XX` ya tomadas, con su justificación).
4. Correr `git log --oneline` para confirmar el último commit real.
5. Correr `npm install && npm test && npm run build` para confirmar que el repo sigue en verde antes de seguir agregando código.
6. Continuar con la etapa marcada como "Siguiente paso" en la tabla de arriba, o la primera marcada como "Pendiente" si esta tabla no se actualizó.

---

## Contexto

El repositorio `devopsedu-frontend` partió vacío, con solo `CLAUDE.md` y `.claude/skills/`. Durante la sesión de planificación se incorporaron dos fuentes adicionales:

1. El documento de diseño técnico completo (`.claude/Proyecto de Julian Barrera v1.13.md`), del que se extrajo el catálogo de RF-01 a RF-25 (el diseño v1.13 no tiene RF-26, aclarado por el backend en la Etapa 7) y RNF-01 a RNF-25, la especificación de 6 de los 16 casos de uso, el diagrama de estados del `Servicio` (7 estados), el diagrama de componentes (interfaz `IRestAPI` conceptual) y el modelo de datos.
2. **`docs/contrato-api.md`** — el contrato real de la API del backend (`devopsedu-backend`, rama `segunda-semana`, commit `04f88c2`). Este documento **reemplaza cualquier inferencia** hecha a partir del documento de diseño para los grupos ya implementados: `/api/auth`, `/api/servicios`, `/api/servidor`. Es la fuente autoritativa para el cliente HTTP, los hooks de TanStack Query y los mocks de MSW de esos tres módulos.

**Hallazgo clave del contrato de API (histórico, ya superado):** en su versión original, el backend solo tenía implementados los grupos de Sesión (`/api/auth`), Servicios (`/api/servicios`) y Recursos del servidor (`/api/servidor`); Aprendizaje y Administración no existían todavía. Eso cambió con la rama `cuarta-semana` del backend (Etapa 6 del backend, RF-20 a RF-24): `/api/modulos`, `/api/rutas`, `/api/aprendizaje/*` y `/api/usuarios` (DT-08 del backend) ya están implementados, así que las Etapas 4 y 5 también se construyeron integradas contra la API real, igual que las Etapas 1-3. Reportes y Exportación (RF-25) llegaron después, con la Etapa 7 del backend (Etapa 5b de este plan).

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

## Etapa 3 — Módulo Monitoreo (RF-15, RF-18, RF-19, CU-09) — COMPLETA (`1e237f5`)

- [x] Decidido y documentado como `DT-06` (`docs/decisiones-tecnicas.md`): "Histórico de operaciones" usa un selector de servicio (no existe `GET /api/historico` global). El usuario eligió esta opción sobre un histórico global compuesto por N+1 peticiones y sobre no construir una vista separada.
- [x] **Histórico de operaciones** (`src/modulos/monitoreo/paginas/historico-operaciones.page.tsx`, ruta `/monitoreo/historico`) — RF-15, CU-09. `CampoSelector` (nuevo componente común) con los servicios del usuario (`GET /api/servicios`); al elegir uno, `useServicio` trae su detalle y se reutiliza `ListaRegistros` (extraído de `detalle-servicio.page.tsx` a `src/modulos/servicios/componentes/lista-registros.tsx`, con su propia prueba — refactor sin cambio de comportamiento).
- [x] **Gráficas de métricas** (`graficas-metricas.page.tsx`, ruta `/monitoreo/metricas`) — RF-18, RF-19, apoya CU-08. Mismo selector de servicio + `GET /api/servicios/:idServicio/metricas` (`use-metricas-servicio.ts`, con `refetchInterval: 5000` para actualización automática sin WebSockets, y `enabled` condicionado a tener un servicio elegido). Dos gráficas de línea independientes con Recharts (CPU y memoria), **no un solo eje compartido**: ambas magnitudes tienen escalas muy distintas (CPU 0-8 núcleos vs. memoria hasta 131072 MB) y combinarlas distorsionaría la lectura (ver skill `dataviz`, regla de "un solo eje"). Colores tomados de `src/diseno/tokens.ts` (`colores.primario`, `colores.exito`), no hex sueltos.
- [x] `src/tipos/metrica.ts` (tipo `Metrica`, sin lógica — no requiere TDD).
- [x] Enlaces "Histórico" y "Gráficas de métricas" agregados a `ENLACES` en `barra-navegacion.tsx`; rutas anidadas en `DisenoAutenticado` + `GuardaRol` (mismo grupo de roles que Servicios, ya que ambas vistas dependen de `GET /api/servicios`).
- [x] Handler de MSW por defecto para `GET /api/servicios/:idServicio/metricas` en `tests/mocks/handlers.ts`.
- [x] Verificación: `npm test` (104 pruebas unitarias + integración), `npm run test:coverage` (98% líneas/statements, 92% ramas, 92% funciones), `npm run build`, `npm run lint` — todo en verde.
- [x] Verificación manual con `npm run dev` contra el backend real — confirmada por el usuario (2026-10-10).

No se contempló la tercera forma de error de `errores-api.ts` (`400` de query sin `detalles`, sección 3.7 del contrato) porque esta etapa no expone filtros `desde`/`hasta` en la UI — la llamada a métricas se hace sin query params. Si se agregan filtros de rango de fechas más adelante, ese caso de error debe cubrirse entonces.

---

## Etapa 4 — Módulo Aprendizaje del estudiante (RF-22 a RF-24, CU-12 a CU-14) — COMPLETA (`5d08be3`, `90417cb`, `14fb0e8`)

El backend avanzó a la rama `cuarta-semana` e implementó de verdad `/api/aprendizaje/*` (sección 6 del contrato actualizado), incluyendo los endpoints `GET /api/modulos/:idModulo` (4.2b) y `GET /api/aprendizaje/modulos/:idModulo` (6.1b) que resolvieron un vacío detectado en la primera revisión del contrato (no había forma de que el estudiante consultara el contenido educativo de un módulo). Por eso esta etapa se construyó **integrada contra el backend real**, no contra mocks especulativos como preveía la versión anterior de este plan.

- [x] **Mi ruta** (`src/modulos/aprendizaje/paginas/mi-ruta.page.tsx`, ruta `/aprendizaje/mi-ruta`) — RF-22, CU-13. `GET /api/aprendizaje/mi-ruta` (`use-mi-ruta.ts`). Casos: sin ruta asignada (`200` con `null`), módulos ordenados por `ordenSecuencia` con el progreso, cada uno enlazando a su contenido.
- [x] **Actividad / contenido de módulo** (`modulo-aprendizaje.page.tsx`, ruta `/aprendizaje/modulos/:idModulo`) — RF-23, CU-12. Al montar llama `POST .../iniciar` (idempotente) y `GET .../modulos/:idModulo` (6.1b) para el contenido. Los cuatro tipos de bloque (texto, imagen, enlace, actividad) se renderizan con el componente nuevo `src/modulos/aprendizaje/componentes/bloque-contenido.tsx`; el bloque `texto` (Markdown) se renderiza con `react-markdown` (ver `DT-07`).
- [x] **Evaluación** (`evaluacion-modulo.page.tsx`, ruta `/aprendizaje/modulos/:idModulo/evaluacion`, mockup Vista 12) — RF-24, CU-14. Preguntas de opción múltiple con radios accesibles, envío deshabilitado hasta responder todas, retroalimentación por pregunta sin revelar la respuesta correcta. Cubre los tres errores propios de esta vista (`409 EvaluacionYaAprobadaError`, `409 IntentosAgotadosError`, `422 EvaluacionNoDisponibleError`).
- [x] `src/tipos/aprendizaje.ts` con las formas de `Modulo`, `BloqueContenido`, `Actividad`, `Evaluacion`, `RutaAsignada`, `MiRuta`, `ModuloConContenido`, etc. (archivo de tipos puro, sin TDD).
- [x] `ENLACES` en `barra-navegacion.tsx` extendido con filtrado por rol (nuevo campo `rolesPermitidos` por enlace): "Mi ruta" solo visible para `estudiante`. Nuevo bloque `GuardaRol` en `rutas.tsx` para las tres rutas de este módulo.
- [x] Handlers de MSW por defecto para los 4 endpoints de `/api/aprendizaje/*` en `tests/mocks/handlers.ts`.
- [x] Verificación: `npm test` (165 pruebas unitarias + integración en total tras Etapas 4 y 5), `npm run test:coverage` (≈98% líneas/statements, 91% ramas, 92% funciones — sobre los umbrales 75/75/70/75), `npm run build`, `npm run lint` — todo en verde.
- [x] Verificación manual con `npm run dev` contra el backend real — confirmada por el usuario (2026-10-10).
- [x] Correcciones posteriores a la verificación manual del 2026-09-12: `retry: false` por defecto en `ProveedorQuery` (`90417cb`, `DT-12`) y estado por módulo con bloqueo secuencial en "Mi ruta" (`14fb0e8`, resolución de `DT-11`).

---

## Etapa 5 — Módulo Administración (RF-20, RF-21, CU-10, CU-11) — COMPLETA (`5d08be3`)

El backend implementó `/api/modulos` y `/api/rutas` (Etapa 6 del backend) además de `/api/usuarios` (DT-08 del backend). `/api/reportes` (RF-25, CU-15, CU-16) no existía todavía, así que Reportes y Exportación se construyeron después, en la Etapa 5b.

- [x] **Gestión de módulos** — RF-20, CU-10:
  - `panel-modulos.page.tsx` (ruta `/administracion/modulos`) — `GET /api/modulos`.
  - `crear-modulo.page.tsx` / `editar-modulo.page.tsx` (rutas `/administracion/modulos/nuevo` y `/administracion/modulos/:idModulo`) — `POST`/`PUT /api/modulos`, con el formulario compartido `src/modulos/administracion/componentes/formulario-modulo.tsx`.
  - Editor de bloques (`componentes/editor-bloques.tsx`): agregar/quitar/reordenar bloques de texto, imagen, enlace y actividad. El bloque `imagen` sube el archivo a `POST /api/modulos/imagenes` y usa la `url` devuelta.
  - Bloque `texto` con editor WYSIWYG (`src/componentes-comunes/editor-texto-enriquecido.tsx`, TipTap + `tiptap-markdown`, ver `DT-08`) que serializa a Markdown, según lo pedido explícitamente por el usuario (no Markdown crudo).
  - Dentro de `editar-modulo.page.tsx`: secciones para crear la actividad (`componentes/formulario-actividad.tsx`, `POST .../actividades`) y la evaluación (`componentes/formulario-evaluacion.tsx`, `POST .../evaluacion`, preguntas dinámicas de 2-5 opciones) del módulo.
- [x] **Gestión de estudiantes** (RF-21/CU-11 + DT-08 del backend combinados, ver `DT-09` y `DT-10`): `gestion-estudiantes.page.tsx` (ruta `/administracion/estudiantes`). Campo manual de `idUsuario` (no existía endpoint de listado de usuarios; reemplazado por un selector en la Etapa 5b, `DT-20`) + selección de módulos por casillas (orden = orden de selección) → `POST /api/rutas`; sección separada de reseteo de contraseña con `BotonAccionCritica` → `PATCH /api/usuarios/:id/contrasena`.
- [x] `ENLACES` en `barra-navegacion.tsx` extendido con "Módulos de aprendizaje" y "Gestión de estudiantes", visibles solo para `docente`. Nuevo bloque `GuardaRol` en `rutas.tsx`.
- [x] Handlers de MSW por defecto para los 6 endpoints de `/api/modulos`, `/api/rutas` y `/api/usuarios` en `tests/mocks/handlers.ts`.
- [x] Nuevas dependencias `react-markdown` (lectura de Markdown, `DT-07`) y `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/pm` + `tiptap-markdown` (editor WYSIWYG, `DT-08`), ambas justificadas en `docs/decisiones-tecnicas.md` (RNF-20).
- [x] Verificación: incluida en la misma corrida de la Etapa 4 (`npm test`, `npm run test:coverage`, `npm run build`, `npm run lint` — todo en verde).
- [x] Verificación manual con `npm run dev` contra el backend real (como docente) — confirmada por el usuario (2026-10-10).

Reportes y Exportación, que quedaron pendientes al cerrar esta etapa, se completaron en la Etapa 5b.

---

## Mejora transversal — Configuración avanzada de servicios y nuevo ciclo de vida de contenedores (RF-05 a RF-08, RF-11, RF-14, RF-17, RF-23, CU-03, CU-05 a CU-07, CU-12) — COMPLETA (`d315318`)

No es una etapa del plan original. Surgió al probar la calificación automática de actividades: con `DT-04` el asistente enviaba puertos y volúmenes vacíos, lo que hacía imposible aprobar actividades con `puertosMinimos` o `volumenesMinimos`. Coincidió con el cambio del ciclo de vida de contenedores en el backend (DT-15, DT-16 y DT-17 del backend), sincronizado en `docs/contrato-api.md` en `d3f7df0`.

- [x] **Asistente de creación en dos pasos** (`crear-servicio.page.tsx`) con editores de puertos, variables de entorno y volúmenes (`editor-puertos.tsx`, `editor-variables-entorno.tsx`, `editor-volumenes.tsx`, con `useFieldArray`) y validación compartida en `src/modulos/servicios/esquema-configuracion.ts` — ver `DT-13`, que supera a `DT-04`.
- [x] **Editar configuración** (`editar-configuracion.page.tsx`, ruta `/servicios/:idServicio/configuracion`) — RF-08. `PUT /api/servicios/:idServicio/configuracion`, reutilizando los mismos dos pasos (`campos-recursos.tsx`, `paso-configuracion-avanzada.tsx`). La imagen Docker vuelve a ser editable (`DT-16`).
- [x] **Detalle de servicio**: resumen de la configuración vigente (`resumen-configuracion.tsx`), volúmenes realmente montados (`volumenes-montados.tsx`), `Desplegar` como acción crítica cuando existe un contenedor previo y aviso de pérdida de datos construido con `contenedor.volumenes` (`aviso-perdida-datos.tsx`) — ver `DT-15`. Tras desplegar o eliminar se muestra qué volúmenes se eliminaron o conservaron.
- [x] **Formulario de actividad** con las cinco condiciones de aprobación opcionales (`formulario-actividad.tsx`) — ver `DT-14`.
- [x] Verificación manual con `npm run dev` contra el backend real — confirmada por el usuario (2026-10-10).
- [x] Corrección posterior (2026-10-10): la prueba "elimina el servicio tras confirmar en el dialogo" de `detalle-servicio.page.test.tsx` simulaba `DELETE /api/servicios/:idServicio` con la forma anterior a DT-15 del backend (sin `recreado`, `volumenesEliminados` ni `volumenesOmitidos`). La página fallaba con un `TypeError` que Vitest reportaba como "Unhandled error" mientras la prueba seguía en verde. Se actualizó el mock a la forma vigente del contrato. Suite tras la corrección: 262 pruebas en 53 archivos, sin errores no capturados; cobertura 98.4% líneas/statements, 91% ramas, 93% funciones.

---

## Mejora transversal — Estado visual de actividades, barra lateral por categorías y panel principal con datos (RF-10, RF-16, RF-17, RF-22, RF-23, RNF-03, RNF-05, CU-08, CU-12, CU-13) — COMPLETA (`5317f9f`, `29a626e`, `1373b2d`, `b39a284`, `2d57459`)

No es una etapa del plan original. Surgió a partir de mockups aportados por el usuario para tres piezas: el estudiante no distinguía qué actividades prácticas le faltaban, la barra lateral de `DT-05` era una lista plana de enlaces y el panel principal solo ofrecía tres accesos genéricos. Coincidió con DT-18 del backend, que agrega `completada` y `fechaCompletada` a cada bloque `actividad` del contrato 6.1b. Decisiones registradas en `DT-17` (`docs/decisiones-tecnicas.md`), que supera en parte a `DT-05`.

- [x] **Contrato y decisiones** (`5317f9f`): sección 6.1b de `docs/contrato-api.md` sincronizada con el estado de las actividades y `DT-17` registrada.
- [x] **Sistema de diseño** (`29a626e`): tokens de color suaves para éxito, advertencia, primario y recursos (`src/diseno/tokens.ts`, `tailwind.config.ts`); componentes comunes nuevos `barra-progreso.tsx`, `enlace-boton.tsx` (enlace con aspecto de botón, evita anidar `<button>` en `<a>`) y `tarjeta.tsx`; utilidad `src/utilidades/formatear-capacidad.ts`.
- [x] **Barra lateral por categorías** (`1373b2d`): `barra-navegacion.tsx` agrupa los enlaces en General, Aprendizaje, Administración, Entorno, Monitoreo y Cuenta, con iconos, y oculta las categorías sin enlaces para el rol. Recibe un `encabezadoLateral` opcional que `diseno-autenticado.tsx` usa para mostrar `ResumenRutaLateral` (`src/modulos/aprendizaje/componentes/resumen-ruta-lateral.tsx`, con `utilidades/progreso-ruta.ts`) solo al estudiante, sin acoplar `componentes-comunes` al módulo de aprendizaje.
- [x] **Estado de las actividades** (`b39a284`): `tarjeta-actividad.tsx` (nuevo) pinta la actividad en amarillo (pendiente) o verde (completada, con fecha) y escribe el estado como texto (RNF-05). Varias actividades en un módulo se numeran para tener nombres accesibles distintos. Handlers de MSW y `tests/fixtures/aprendizaje.factory.ts` actualizados con los campos nuevos.
- [x] **Panel principal con datos** (`2d57459`): `panel-principal.page.tsx` compone `TarjetaMisServicios` (conteo por estado y hasta cinco servicios), `TarjetaRutaAprendizaje` (solo estudiante: progreso y "Continúa donde quedaste") y `TarjetaCapacidad` (comprometido frente al total), cada una con sus estados de carga, error y vacío.
- [x] Verificación (2026-10-23): `npm test` (297 pruebas en 62 archivos, sin errores no capturados), `npm run test:coverage` (98.6% líneas/statements, 92.3% ramas, 93.6% funciones), `npm run build`, `npx tsc --noEmit` y `npm run lint` — todo en verde.
- [x] Verificación manual con `npm run dev` contra el backend real — confirmada por el usuario (2026-10-23).

---

## Etapa 5b — Reportes, Exportación y listado de estudiantes (RF-21, RF-25, CU-11, CU-15, CU-16) — COMPLETA (`72a9287`, `5fc6c61`, `a42ceab`, `ed619bb`)

El backend completó su Etapa 7 (DT-19 a DT-22 del backend): `GET /api/usuarios/estudiantes` (7.2), `GET /api/reportes/progreso` (8b.1) y `GET /api/reportes/progreso/exportar` (8b.2), todos exclusivos del docente. Aclaró además que el catálogo del diseño termina en RF-25 (no existe RF-26) y que el perfil investigador se descartó. Las decisiones de presentación se confirmaron con el usuario antes de implementar (`DT-18`), incluida la de seguir la línea visual de DT-17.

- [x] **Documentación y tipos** (`72a9287`): contrato sincronizado, `CLAUDE.md` corregido (secciones 1 y 8), `DT-18` a `DT-20`, `src/tipos/reportes.ts`, `tests/fixtures/reporte.factory.ts` y handlers por defecto de MSW para los tres endpoints.
- [x] **Gestión de estudiantes** (`5fc6c61`, `DT-20`, supera a `DT-09`):
  - `CampoSelector` con `Nombre (correo)` poblado por `use-estudiantes.ts`, en lugar del campo manual de `idUsuario`.
  - Ruta vigente del estudiante elegido con `ProgresoRutaEstudiante` (componente nuevo, compartido con Reportes).
  - La vista se reorganizó en tarjetas con la línea visual de DT-17, y sus textos llevan tildes y eñes.
  - `useAsignarRuta` invalida el listado y el reporte.
- [x] **Reportes** (`a42ceab`, `DT-18`): `reportes.page.tsx` (ruta `/administracion/reportes`, solo `docente`).
  - Selector "Todos los estudiantes / un estudiante" guardado en la URL (`?idUsuario=N`).
  - Con "Todos": `ListaProgresoEstudiantes` y `TarjetaResumenGrupo` con datos de 7.2 (`utilidades/resumen-grupo.ts`).
  - Con un estudiante: `DetalleProgresoEstudiante` con datos de 8b.1 (`use-reporte-progreso.ts`). Muestra por módulo el estado, las actividades, la mejor nota, los intentos y si aprobó.
  - Enlace "Reportes" en la categoría Administración de la barra lateral.
  - `InsigniaEstadoModulo` pasó a los tonos suaves de DT-17, que cumplen el contraste AA. También cambió su aspecto en Mi ruta.
- [x] **Exportación** (`ed619bb`, `DT-19`):
  - `AccionesExportacion` descarga en CSV o PDF lo que se está consultando, con `use-exportar-reporte.ts` (`responseType: "blob"`).
  - El nombre del archivo sale de `Content-Disposition` (`src/utilidades/descarga-archivo.ts`).
  - Los errores se leen del JSON dentro del `Blob` (`normalizarErrorApiDescarga`).
  - `Boton` admite un icono decorativo.
  - Prueba de integración: `tests/integracion/modulos/administracion/consultar-y-exportar-reporte.test.tsx`.
- [x] Verificación (2026-10-23): `npm test` (332 pruebas en 66 archivos, sin errores no capturados), `npm run test:coverage` (98.8% líneas/statements, 92.8% ramas, 94.5% funciones), `npx tsc --noEmit`, `npm run build` y `npm run lint`, todo en verde.
- [x] **Verificación manual** con `npm run dev` contra el backend real, confirmada por el usuario (2026-10-23):
  - Como docente, en Gestión de estudiantes: elegir un estudiante, asignarle una ruta y ver la ruta vigente actualizada.
  - Como docente, en Reportes: "Todos", un estudiante concreto y el regreso a todos.
  - Exportar CSV (abrirlo en Excel y revisar tildes y eñes) y PDF, con y sin filtro, y revisar el nombre propuesto del archivo.
  - Como estudiante: no aparece "Reportes" y `/administracion/reportes` redirige al panel. La insignia de estado de Mi ruta se ve con los tonos suaves.
  - Revisión visual de las tres vistas junto al panel principal, también en ancho de móvil.

---

## Verificación end-to-end del plan (aplica a cada etapa)

- `npm test` pasa completo y `npm run test:coverage` no cae de los umbrales (75/75/70/75).
- Cada vista nueva se verifica manualmente con `npm run dev` contra el backend real.
- La salida de `npm test` no debe reportar "Unhandled errors": Vitest los muestra aparte y una prueba puede seguir en verde aunque el componente haya fallado.
- `npm run build` sin errores de TypeScript estricto.
- Cada commit sigue el formato de `trazabilidad-requerimientos`; cada archivo de vista/prueba lleva cabecera con RF/CU.
- Las decisiones técnicas nuevas (`DT-02` en adelante) se registran en `docs/decisiones-tecnicas.md` antes de cerrar la etapa correspondiente, y este archivo (`docs/plan-de-desarrollo.md`) se actualiza marcando lo completado y moviendo el "Próximo paso concreto".
