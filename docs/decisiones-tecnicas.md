# Decisiones técnicas — DevOpsEdu Frontend

## DT-01: Id del rol "docente" asumido hasta confirmación del backend

**Fecha:** 2026-08-07
**Contexto:** `docs/contrato-api.md` solo confirma `idRol: 1` para el rol `estudiante` (rol por defecto asignado en `POST /api/auth/registro`). No hay ningún ejemplo en el contrato que muestre el `idRol` correspondiente a `docente`, necesario para `GuardaRol` en `src/enrutamiento/rutas.tsx`.
**Decisión:** Asumir `idRol = 2` para `docente` en `src/tipos/roles.ts`, dejando el supuesto documentado en un comentario en el propio archivo.
**Consecuencias:** Si el backend usa un id distinto para `docente`, las guardas de rol de los módulos de Servicios/Aprendizaje/Administración fallarán silenciosamente (redirigirán a un usuario docente legítimo fuera de sus vistas). Debe verificarse contra el backend real antes de habilitar `GuardaRol` en rutas protegidas, o reemplazarse por una consulta a un endpoint de catálogo de roles si el backend lo expone más adelante.
**Alternativas consideradas:** Consultar el rol por nombre en vez de id. Descartada porque el contrato actual solo expone `idRol` (numérico) en las respuestas de `usuario`, no un nombre de rol.
