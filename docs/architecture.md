# Arquitectura y decisiones tecnológicas

Este documento registra las decisiones tecnológicas oficiales del proyecto.
No fija versiones de dependencias ni implica que las aplicaciones ya estén
inicializadas.

## Arquitectura

- El repositorio es un monorepositorio.
- El frontend es una aplicación independiente en `apps/web/`.
- El backend es modular y reside en `services/api/`; sus módulos no se separan
  en microservicios.
- No crear gestores de dependencias independientes para cada módulo del
  backend.
- Los componentes colaboran mediante contratos públicos documentados en
  `contracts/`, evitando dependencias sobre implementaciones internas.

## Tecnologías oficiales

| Área | Tecnologías y decisiones |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS y shadcn/ui |
| Backend | Python 3.12, FastAPI, Pydantic y OpenAPI |
| Base de datos | PostgreSQL y Supabase |
| Vectorización | pgvector únicamente si resulta necesario para RAG |
| Inteligencia artificial | Gemini API; RAG solo sobre conocimiento previamente validado; respuestas estructuradas con JSON Schema; heurísticas deterministas |
| Ciberseguridad | Cloudflare Turnstile, RapidFuzz, tldextract, dnspython, RDAP y hashlib para deduplicación; Google Safe Browsing sujeto a disponibilidad |
| Pruebas y calidad | Pytest, Playwright, ESLint y GitHub Actions |
| Despliegue previsto | Vercel para frontend, Render para backend y Supabase para base de datos |

## Comunicación y validación

Las interfaces HTTP usan REST y JSON. OpenAPI documenta las API y Pydantic
valida los modelos del backend. Los contratos concretos, sus esquemas,
entradas, salidas y errores deben acordarse con los propietarios afectados y
publicarse en `contracts/`.

Las respuestas estructuradas de IA se validan conforme a JSON Schema. El RAG
solo recupera conocimiento previamente validado; las heurísticas deben ser
deterministas.

## Alcance de esta decisión

Las tecnologías anteriores quedan establecidas, pero su instalación,
configuración, versiones y despliegue se implementan en las Issues
correspondientes. pgvector es condicional; Google Safe Browsing depende de su
disponibilidad. No agregar tecnologías sustitutas ni inicializar aplicaciones
como parte de esta definición.
