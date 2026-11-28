# Dominios oficiales de organizaciones

Conjunto inicial de dominios de organizaciones de varios sectores, curado para
servir como insumo de H26-10. No implementa persistencia, consultas ni una
interfaz de catálogo. La inclusión indica que una fuente pública oficial
identifica el dominio; no garantiza la seguridad del dominio, de sus subdominios
ni de mensajes que lo mencionen.

## Registros

La fecha corresponde a la consulta de la fuente. Se conserva el host oficial
publicado por la fuente, sin protocolo, ruta ni `www` cuando solo es una variante
de presentación.

| Organización | Dominio | Sector | Fuente oficial | Fecha de verificación | Observaciones |
| --- | --- | --- | --- | --- | --- |
| National Aeronautics and Space Administration (NASA) | `nasa.gov` | Gobierno y exploración espacial | [USAGov — NASA](https://www.usa.gov/agencies/national-aeronautics-and-space-administration), directorio federal que enlaza a `nasa.gov` | 2026-11-28 | — |
| Centers for Disease Control and Prevention (CDC) | `cdc.gov` | Salud pública | [USAGov — CDC](https://www.usa.gov/agencies/centers-for-disease-control-and-prevention), directorio federal que enlaza a `cdc.gov` | 2026-11-28 | — |
| Food and Drug Administration (FDA) | `fda.gov` | Regulación sanitaria | [USAGov — FDA](https://www.usa.gov/federal-agencies/food-and-drug-administration), directorio federal que enlaza a `fda.gov` | 2026-11-28 | — |
| World Health Organization (WHO) | `who.int` | Salud internacional | [WHO — Contact us](https://www.who.int/about/contact-us), página institucional que enlaza sus canales oficiales bajo `who.int` | 2026-11-28 | Fuente primaria de la propia organización; no es una corroboración independiente. |
| United Nations (UN) | `un.org` | Organización internacional | [UN — About the UN](https://www.un.org/en/visit/about-un), página institucional que identifica el sitio principal de la ONU | 2026-11-28 | Fuente primaria de la propia organización; no es una corroboración independiente. |
| Harvard University | `harvard.edu` | Educación superior | [NCES College Navigator — Harvard University](https://nces.ed.gov/collegenavigator?id=166027&q=Harvard+University&s=all), ficha del National Center for Education Statistics que publica `www.harvard.edu` como sitio web | 2026-11-28 | Se registra el dominio base; la ficha también enlaza subdominios institucionales. |
| JPMorgan Chase & Co. | `jpmorganchase.com` | Servicios financieros | [SEC EDGAR — resultados del tercer trimestre de 2026](https://www.sec.gov/Archives/edgar/data/19617/000162828026065582/a3q26erfexhibit991narrative.htm), documento corporativo presentado ante la SEC que identifica `www.jpmorganchase.com` como sitio de la firma | 2026-11-28 | — |
| Department of Energy (DOE) de Estados Unidos | `energy.gov` | Energía y gobierno | [DOE — Contact Us](https://www.energy.gov/contact-us), página del departamento alojada en `energy.gov` e identificada como sitio oficial del gobierno | 2026-11-28 | Fuente primaria de la propia organización; no es una corroboración independiente. |
| NHS England | `england.nhs.uk` | Salud pública | [GOV.UK — NHS England](https://www.gov.uk/government/organisations/nhs-england), perfil gubernamental que indica que NHS England tiene un sitio separado y enlaza `england.nhs.uk` | 2026-11-28 | — |
| Amtrak | `amtrak.com` | Transporte ferroviario | [U.S. Department of Transportation — Nationwide Providers](https://www.transportation.gov/transerve/nation-wide-providers), directorio que identifica `www.amtrak.com` como sitio web | 2026-11-28 | La fuente devolvió HTTP 403 a la consulta automatizada; el resultado público del buscador mostró la entrada y el dominio. Revalidar manualmente. |

## Criterio de curación y límites

- Se priorizaron directorios gubernamentales, registros regulatorios o páginas
  institucionales oficiales que enlazan o identifican el sitio.
- Cuando la evidencia procede únicamente de la propia organización, se marca
  como fuente primaria y se evita presentarla como verificación independiente.
- Se conservaron los dominios que publica la fuente; no se infieren dominios de
  correo, dominios parecidos, subdominios adicionales ni marcas relacionadas.
- Las variantes `www` se normalizan al dominio base únicamente para esta lista;
  un consumidor que necesite comparar hosts debe conservar y validar el host
  completo observado.
- Las fechas indican cuándo se consultó la evidencia, no una garantía de que el
  dominio siga bajo el control de la organización después de esa fecha.
- Los registros con observaciones requieren revisión antes de usarse como
  referencias de alta confianza.

Este documento es un insumo de investigación para H26-10, no un contrato nuevo
ni un conjunto de reglas de decisión. La persistencia, el formato de consumo y
las políticas de confianza quedan fuera del alcance de H26-36.
