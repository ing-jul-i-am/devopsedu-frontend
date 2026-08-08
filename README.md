# DevOpsEdu — Frontend

Interfaz web de la Plataforma Educativa para Gestión DevOps. Ver [CLAUDE.md](./CLAUDE.md) para convenciones del proyecto y [docs/contrato-api.md](./docs/contrato-api.md) para el contrato de la API del backend.

## Requisitos

- Node.js 20+

## Instalación

```bash
npm install
cp .env.example .env
```

## Comandos

| Acción | Comando |
| --- | --- |
| Servidor de desarrollo | `npm run dev` |
| Compilar | `npm run build` |
| Previsualizar build | `npm run preview` |
| Correr todas las pruebas | `npm test` |
| Pruebas en modo watch | `npm run test:watch` |
| Pruebas con cobertura | `npm run test:coverage` |
| Solo unitarias | `npm run test:unit` |
| Solo integración | `npm run test:integration` |
| Lintar | `npm run lint` |
| Formatear | `npm run format` |

El proyecto sigue TDD estricto (ver `.claude/skills/ciclo-tdd`). Toda funcionalidad nueva comienza por una prueba que falla.
