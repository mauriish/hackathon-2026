CREATE TABLE official_identities (
    organization TEXT NOT NULL CHECK (length(trim(organization)) > 0),
    domain TEXT PRIMARY KEY CHECK (
        domain = lower(domain)
        AND length(domain) > 0
        AND domain !~ '[^a-z0-9.-]'
        AND domain !~ '(^\.|\.$|\.\.|^-|-$)'
    ),
    sector TEXT NOT NULL CHECK (length(trim(sector)) > 0),
    source_url TEXT NOT NULL CHECK (source_url LIKE 'https://%'),
    verified_at DATE NOT NULL,
    notes TEXT
);

INSERT INTO official_identities (
    organization, domain, sector, source_url, verified_at, notes
) VALUES
    (
        'National Aeronautics and Space Administration (NASA)',
        'nasa.gov',
        'Gobierno y exploración espacial',
        'https://www.usa.gov/agencies/national-aeronautics-and-space-administration',
        DATE '2026-11-28',
        NULL
    ),
    (
        'Centers for Disease Control and Prevention (CDC)',
        'cdc.gov',
        'Salud pública',
        'https://www.usa.gov/agencies/centers-for-disease-control-and-prevention',
        DATE '2026-11-28',
        NULL
    ),
    (
        'Food and Drug Administration (FDA)',
        'fda.gov',
        'Regulación sanitaria',
        'https://www.usa.gov/federal-agencies/food-and-drug-administration',
        DATE '2026-11-28',
        NULL
    ),
    (
        'World Health Organization (WHO)',
        'who.int',
        'Salud internacional',
        'https://www.who.int/about/contact-us',
        DATE '2026-11-28',
        'Fuente primaria de la propia organización; no es una corroboración independiente.'
    ),
    (
        'United Nations (UN)',
        'un.org',
        'Organización internacional',
        'https://www.un.org/en/visit/about-un',
        DATE '2026-11-28',
        'Fuente primaria de la propia organización; no es una corroboración independiente.'
    ),
    (
        'Harvard University',
        'harvard.edu',
        'Educación superior',
        'https://nces.ed.gov/collegenavigator?id=166027&q=Harvard+University&s=all',
        DATE '2026-11-28',
        'Se registra el dominio base; la ficha también enlaza subdominios institucionales.'
    ),
    (
        'JPMorgan Chase & Co.',
        'jpmorganchase.com',
        'Servicios financieros',
        'https://www.sec.gov/Archives/edgar/data/19617/000162828026065582/a3q26erfexhibit991narrative.htm',
        DATE '2026-11-28',
        NULL
    ),
    (
        'Department of Energy (DOE) de Estados Unidos',
        'energy.gov',
        'Energía y gobierno',
        'https://www.energy.gov/contact-us',
        DATE '2026-11-28',
        'Fuente primaria de la propia organización; no es una corroboración independiente.'
    ),
    (
        'NHS England',
        'england.nhs.uk',
        'Salud pública',
        'https://www.gov.uk/government/organisations/nhs-england',
        DATE '2026-11-28',
        NULL
    ),
    (
        'Amtrak',
        'amtrak.com',
        'Transporte ferroviario',
        'https://www.transportation.gov/transerve/nation-wide-providers',
        DATE '2026-11-28',
        'La fuente devolvió HTTP 403 a la consulta automatizada; el resultado público del buscador mostró la entrada y el dominio. Revalidar manualmente.'
    );
