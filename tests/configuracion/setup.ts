import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { servidorMock } from "../mocks/servidor";

beforeAll(() => servidorMock.listen({ onUnhandledRequest: "error" }));
afterEach(() => servidorMock.resetHandlers());
afterAll(() => servidorMock.close());

// Con `globals: false` RTL no detecta el `afterEach` global para su
// limpieza automatica del DOM entre pruebas; se registra explicitamente.
afterEach(() => cleanup());
