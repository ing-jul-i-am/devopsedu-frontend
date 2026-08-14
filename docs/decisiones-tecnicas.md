# Decisiones técnicas — DevOpsEdu Frontend

## DT-01: Id del rol "docente" asumido hasta confirmación del backend

**Fecha:** 2026-08-07
**Contexto:** `docs/contrato-api.md` solo confirma `idRol: 1` para el rol `estudiante` (rol por defecto asignado en `POST /api/auth/registro`). No hay ningún ejemplo en el contrato que muestre el `idRol` correspondiente a `docente`, necesario para `GuardaRol` en `src/enrutamiento/rutas.tsx`.
**Decisión:** Asumir `idRol = 2` para `docente` en `src/tipos/roles.ts`, dejando el supuesto documentado en un comentario en el propio archivo.
**Consecuencias:** Si el backend usa un id distinto para `docente`, las guardas de rol de los módulos de Servicios/Aprendizaje/Administración fallarán silenciosamente (redirigirán a un usuario docente legítimo fuera de sus vistas). Debe verificarse contra el backend real antes de habilitar `GuardaRol` en rutas protegidas, o reemplazarse por una consulta a un endpoint de catálogo de roles si el backend lo expone más adelante.
**Alternativas consideradas:** Consultar el rol por nombre en vez de id. Descartada porque el contrato actual solo expone `idRol` (numérico) en las respuestas de `usuario`, no un nombre de rol.

## DT-02: Comportamiento real del checkbox "recordar sesión"

**Fecha:** 2026-08-14
**Contexto:** El mockup Vista 01 (inicio de sesión) incluye una casilla "recordar sesión", pero `docs/contrato-api.md` no define ningún concepto de sesión persistente vs. temporal en el backend: el JWT emitido por `POST /api/auth/login` no tiene semántica distinta según ese campo (el campo ni siquiera se envía al backend). Dejar el checkbox sin efecto funcional habría sido una casilla decorativa, lo que viola RNF-05 (accesibilidad y coherencia de controles interactivos).
**Decisión:** El checkbox controla exclusivamente el almacenamiento del lado del cliente: marcado (valor por defecto) guarda el token y el usuario en `localStorage` (sobrevive al cierre del navegador); desmarcado los guarda en `sessionStorage` (se pierde al cerrar la pestaña). Implementado en `src/infraestructura/almacenamiento-sesion.ts` (parámetro `persistente` de `guardarSesion`), con pruebas en `tests/unitarias/infraestructura/almacenamiento-sesion.test.ts`.
**Consecuencias:** `obtenerToken` y `obtenerUsuario` deben consultar ambos almacenamientos (localStorage primero, sessionStorage como respaldo) y `limpiarSesion` debe limpiar los dos. Si en el futuro el backend distingue sesiones persistentes de temporales (p. ej. tokens con distinto tiempo de vida), esta decisión debe revisarse.
**Alternativas consideradas:** Ignorar el checkbox y persistir siempre en `localStorage` (como ya ocurría en el scaffolding). Descartada por dejar un control de formulario sin comportamiento observable.

## DT-03: Vista de perfil sin edición (RF-04 pendiente en el backend)

**Fecha:** 2026-08-14
**Contexto:** El plan de Etapa 1 (`docs/plan-de-desarrollo.md`) contempla la vista de perfil (RF-03, CU-02) con cierre de sesión. RF-04 (edición de perfil) no tiene endpoint implementado: `docs/contrato-api.md` sección 6 confirma que `PUT /api/usuarios/*` está pendiente.
**Decisión:** `src/modulos/sesion/paginas/perfil.page.tsx` solo muestra los datos de `usuario` ya disponibles en la sesión local (nombre, correo, fecha de registro) y el botón de cerrar sesión. No se agrega ningún formulario de edición ni llamada HTTP especulativa.
**Consecuencias:** RF-04 queda sin implementar hasta que el backend exponga el endpoint correspondiente. Cuando eso ocurra, esta vista debe extenderse con un formulario de edición siguiendo el mismo procedimiento TDD.
**Alternativas consideradas:** Construir el formulario de edición contra un mock especulativo de MSW. Descartada porque Etapas 1-3 están definidas como completamente integradas contra el backend real (ver "Contexto" en `docs/plan-de-desarrollo.md`); introducir un mock aquí rompería esa regla sin necesidad, ya que RF-04 no es indispensable para cerrar la Etapa 1.
