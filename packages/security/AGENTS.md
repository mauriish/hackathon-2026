# Límites de `packages/security/`

Responsable: `aguillonmarthaguadalupe-lab` (QA y Security).

- Mantén aquí identidad digital, reputación, ponderación/scoring y controles
  antiabuso, además de pruebas unitarias y documentación específica.
- Los módulos consumidores usan interfaces públicas; no edites sus archivos.
- No cambies contratos ni configuración compartida unilateralmente. Solicita
  cambios transversales mediante Issue o PR con justificación y revisión de
  `mauriish` y de los propietarios afectados.
- Tecnologías oficiales del área: Cloudflare Turnstile, RapidFuzz, tldextract,
  dnspython, RDAP y hashlib para deduplicación; Google Safe Browsing sujeto a
  disponibilidad. Consulta `docs/architecture.md` para el contexto completo.
- Conserva contribuciones existentes; no fijes versiones ni añadas tecnologías
  fuera de las decisiones oficiales.
