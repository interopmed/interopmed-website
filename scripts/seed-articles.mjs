import { readFileSync, existsSync } from 'fs'
import pg from 'pg'

const { Client } = pg

// Read database URL from .env.local or .env
let envFile = '.env.local'
if (!existsSync(envFile)) {
  envFile = '.env'
}
const envContent = readFileSync(envFile, 'utf8')
const m = envContent.match(/DATABASE_URL=([^\r\n]+)/)
if (!m) {
  console.error('DATABASE_URL not found in env file')
  process.exit(1)
}
const url = m[1].trim().replace(/^['"]|['"]$/g, '')

const ssl = (url.includes('sslmode=require') || url.includes('neon.tech')) ? { rejectUnauthorized: false } : false
const client = new Client({ connectionString: url, ssl })

const SEED_ARTICLES = [
  {
    slug: 'hl7-v2-to-fhir-mapping-guidelines',
    title: "HL7 v2 to FHIR R4 Mapping Guidelines: An Integration Specialist's Architectural Playbook",
    excerpt:
      'A comprehensive engineering guide on transforming legacy HL7 v2 messages (ADT, ORU, ORM, MDM) into FHIR R4 resources. Master segment-to-resource alignment, clinical data type conversions (CWE to CodeableConcept, TS to instant), LOINC/UCUM normalization, and stateful transaction bundles.',
    category: 'Interoperability',
    author: 'InteropMed Clinical Standards Architecture Group',
    publishedAt: '2026-06-28T00:00:00.000Z',
    sections: [
      {
        heading: 'The Paradigm Shift: From Ephemeral Events to Stateful Clinical Graphs',
        body: [
          'For more than three decades, Health Level Seven version 2 (HL7 v2) has been the workhorse of healthcare integrations. It was built around point-to-point, pipe-delimited trigger events: an admission triggers an ADT^A01 message; a lab result triggers an ORU^R01 message; an order triggers an ORM^O01. Each message is a standalone, transient snapshot sent over TCP/IP sockets via the Minimal Lower Layer Protocol (MLLP).',
          'Fast Healthcare Interoperability Resources (FHIR) changes this paradigm fundamentally. Rather than broadcasting broadcast events that discard state after receipt, FHIR organizes healthcare information into a persistent, interconnected web of clinical resources (such as Patient, Encounter, Observation, and DiagnosticReport) accessed via RESTful HTTPS APIs with standard JSON payloads.',
          'When migrating legacy interfaces to FHIR R4, integration specialists cannot simply perform a 1:1 syntactic string replacement. You are translating an event-driven broadcast model into a relational, stateful clinical graph. This requires careful alignment of message boundaries, identifier namespaces, terminologies, and transaction boundaries.',
        ],
      },
      {
        heading: 'Message-to-Resource Alignment Matrix: The Four Core Clinical Flows',
        body: [
          'In HL7 v2, a single message often contains a composite bundle of patient identity, visit context, clinical measurements, and provider credentials. In FHIR, this composite data must be decomposed into normalized resources linked by logical references.',
          '1. ADT (Admit, Discharge, Transfer): An ADT^A01 (Admit) or ADT^A08 (Update) maps primarily to Patient (from the PID segment), Encounter (from the PV1/PV2 segments), Condition (from the DG1 segment for admission diagnoses), and Coverage/Account (from the IN1/IN2 segments). PID-3 becomes Patient.identifier, while PV1-19 becomes Encounter.identifier.',
          '2. ORU^R01 (Observational Results): The OBR segment represents the diagnostic battery or panel order and maps to DiagnosticReport (and optionally ServiceRequest). Each OBX segment under that OBR represents an individual discrete result (such as Blood Urea Nitrogen or Serum Potassium) and maps to an individual FHIR Observation resource referenced inside DiagnosticReport.result.',
          '3. ORM^O01 / OMG^O19 (General Clinical Orders): The ORC (Common Order) and OBR (Order Detail) segments map to a FHIR ServiceRequest resource. Provider references in ORC-12 map to Practitioner / PractitionerRole resources, while timing specifications in TQ1/ORC-7 map to ServiceRequest.occurrenceTiming.',
          '4. MDM^T02 (Medical Document Management): The TXA segment (Document Notification) maps to a DocumentReference resource, with the clinical text or base64 PDF in the OBX segment stored inside DocumentReference.content.attachment or as a referenced Binary resource.',
        ],
      },
      {
        heading: 'Complex Data Type Transformations: Bridging the Structural Gap',
        body: [
          'HL7 v2 data types are component-based strings separated by carats (^), whereas FHIR uses strictly typed JSON objects. Converting between them requires exact field-to-attribute mapping:',
          '• CE / CWE (Coded With Exceptions) to CodeableConcept: In HL7 v2, a coded element like OBX-3 is structured as `8867-4^Heart rate^LN`. In FHIR R4, this maps to a CodeableConcept containing a Coding array: `coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }]`. When local alternate codes exist in components 4-6 (`^HR_LOCAL^99HOSP`), both standard and local codings should be preserved as separate elements in the Coding array.',
          '• TS (Time Stamp) to instant / dateTime: HL7 v2 timestamps (`20260604101500-0500`) must be converted to standard ISO 8601 strings (`2026-06-04T10:15:00-05:00`). If the source HL7 engine sends timestamps without timezone offsets, integration pipelines must explicitly inject the known facility timezone rather than defaulting to UTC, which could cause medications or vitals to appear hours off-schedule.',
          '• XPN / XCN (Extended Person Name / Composite ID) to HumanName: `DOE^JANE^A^^^DR` maps to `family: "DOE"`, `given: ["JANE", "A"]`, `prefix: ["DR"]`, with `use: "official"`. Name validity periods and aliases must be preserved appropriately.',
          '• CX (Extended Composite ID) to Identifier: Patient identifiers in PID-3 (`MRN98241^^^HOSPITAL^MR`) translate into an Identifier object with `value: "MRN98241"`, `type.coding[0].code: "MR"`, and `system: "http://hospital.example.org/identifiers/mrn"`. Ensuring consistent system URIs across feeds is paramount to prevent duplicate patient records.',
          '• NM (Numeric) + CWE to Quantity: Observation values in OBX-5 with units in OBX-6 (`78|/min`) map to a Quantity object: `valueQuantity: { value: 78, unit: "/min", system: "http://unitsofmeasure.org", code: "/min" }`. Units must be normalized to standard Unified Code for Units of Measure (UCUM) syntax.',
        ],
      },
      {
        heading: 'The Laboratory Pipeline: A Practical ORU^R01 to FHIR Transformation Walkthrough',
        body: [
          'To illustrate real-world mapping, examine an ORU^R01 lab payload containing a Serum Potassium measurement: `OBX|1|NM|2823-3^Potassium [Moles/volume] in Serum or Plasma^LN||4.2|mmol/L|3.5-5.0|N|||F|||20260604101000`.',
          'In this transformation: OBX-2 (Value Type `NM`) instructs the parser to populate Observation.valueQuantity. OBX-3 (`2823-3^Potassium^LN`) supplies Observation.code with a verified LOINC URI (`http://loinc.org`). OBX-5 (`4.2`) and OBX-6 (`mmol/L`) construct the valueQuantity. OBX-7 (`3.5-5.0`) maps to Observation.referenceRange with low.value = 3.5 and high.value = 5.0. OBX-8 (`N` for Normal) maps to Observation.interpretation (`http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation`). OBX-11 (`F` for Final) maps to Observation.status = "final".',
          'Simultaneously, the parent OBR segment generates a DiagnosticReport resource that references this Observation under DiagnosticReport.result, creating a complete diagnostic record that complies with US Core Laboratory Result Observation profiles.',
        ],
      },
      {
        heading: 'Bundle Transactions, Idempotency, and Provenance Auditing',
        body: [
          'In production hospital interfaces, messages are processed continuously. A reliable integration architecture must guarantee idempotency: processing the same HL7 v2 message twice must never create duplicate patient encounters or duplicate lab results.',
          'The industry standard solution is to wrap mapped resources into a FHIR transaction bundle (`type: "transaction"`). Each entry in the bundle uses conditional creates (`ifNoneExist`) or deterministic UUIDv5 identifiers generated by hashing the source system ID and the HL7 message control ID (`MSH-10`) combined with the segment index.',
          'Furthermore, compliance frameworks such as ONC HTI-1 and HIPAA require rigorous provenance tracking. For every transformed FHIR resource, integration engines should emit a Provenance resource referencing the origin MLLP interface, the transformation engine version, the transformation timestamp, and the raw source message hash.',
        ],
      },
      {
        heading: 'Key Implementation Pitfalls to Avoid',
        body: [
          'Integration specialists frequently encounter several recurring traps during HL7-to-FHIR migrations:',
          '1. Mishandling HL7 Null Flavors: In HL7 v2, a field containing `""` (two double quotes) explicitly signifies "delete existing value," whereas an empty field `||` means "leave existing value unchanged." Passing empty strings directly into FHIR updates can inadvertently erase critical patient data.',
          '2. Repeating Segments and Multi-Valued Fields: Fields like PID-3 (Patient Identifier List) often contain multiple repetitions separated by tildes (~), such as an MRN, an SSN, and a Driver’s License. Your parser must iterate over each repetition and assign the appropriate Identifier.type rather than concatenating them.',
          '3. Alert and Notification Fatigue in Interface Engines: When configuring middleware engines (such as Mirth Connect, NextGen Connect, Rhapsody, AWS HealthLake, or Google Cloud Healthcare API), ensure error handling segregates malformed syntax rejections from business validation errors, routing non-critical warnings to dead-letter queues without halting high-priority ICU telemetry pipelines.',
        ],
      },
    ],
  },
  {
    slug: 'why-fhir-native-middleware-matters',
    title: 'Why Hospitals Struggle with Data Exchange—and How FHIR Helps Connect Them',
    excerpt:
      'Point-to-point hospital integrations are brittle and expensive. Here is how modern FHIR-native standards give doctors, engineers, and hospital leaders a shared, reliable way to share patient data.',
    category: 'Interoperability',
    author: 'InteropMed Clinical Informatics Team',
    publishedAt: '2026-05-16T00:00:00.000Z',
    sections: [
      {
        heading: 'Why healthcare integrations feel so broken',
        body: [
          'If you ask any hospital IT engineer or doctor, they will tell you the same thing: getting two hospital systems to talk to each other is much harder than it should be.',
          'Over the past thirty years, hospitals connected systems using custom interface engines and point-to-point cables. When a hospital wanted to connect its emergency room to the central laboratory, engineers wrote custom scripts. When they added a cardiology viewer or ICU monitor, they built another bridge. The result is a messy web of fragile integrations that break whenever a vendor pushes an update.',
        ],
      },
      {
        heading: 'FHIR: A common language for patient data',
        body: [
          'Fast Healthcare Interoperability Resources (FHIR) changes this by providing a clean, universal vocabulary for clinical information. Instead of proprietary data formats, FHIR defines common building blocks called Resources—such as Patient, Observation (vitals and lab values), Encounter, and Medication.',
          'Because FHIR works over the same web standards that power the internet (HTTPS, JSON, REST APIs), developers can build intuitive tools without needing to invent custom data formats from scratch.',
        ],
      },
      {
        heading: 'Better data means safer patient care',
        body: [
          'Interoperability is not just an engineering problem; it is fundamentally about patient safety. When a patient arrives at the emergency department unconscious, the attending physician needs immediate access to their medication allergies, recent electrocardiograms, and chronic conditions.',
          'Standardized data exchange ensures critical health details follow the patient across clinics, diagnostic centers, and referral hospitals without delays or manual re-typing.',
        ],
      },
    ],
  },
  {
    slug: 'clinical-workflows-and-emr-architecture',
    title: 'Designing EMRs Clinicians Actually Want to Use: Workflows, CPOE, and Less Burnout',
    excerpt:
      'Doctors spend nearly two hours documenting for every hour of patient care. Here is how human-centered informatics can streamline charts, reduce alert fatigue, and restore clinical focus.',
    category: 'Clinical Informatics',
    author: 'Dr. N. Dissanayaka, Health Informatician',
    publishedAt: '2026-06-02T00:00:00.000Z',
    sections: [
      {
        heading: 'The documentation dilemma in modern medicine',
        body: [
          'Most clinicians do not dislike technology; they dislike software that feels like an accounting ledger rather than a clinical tool. In a busy clinic or inpatient ward, every extra click, confusing dropdown, or unhelpful pop-up steals attention away from the patient.',
          'Clinical informatics is the art and science of aligning software design with how doctors and nurses actually care for people. When software respects real clinical workflow, it protects clinicians from burnout and reduces medical errors.',
        ],
      },
      {
        heading: 'Fixing alert fatigue in order entry',
        body: [
          'Computerized Physician Order Entry (CPOE) systems are intended to catch dangerous drug interactions. However, when a system fires five generic warnings for every medication ordered, clinicians naturally start clicking through them on autopilot.',
          'To be effective, clinical decision support (CDS) must be tailored, contextual, and non-disruptive. Critical alerts should only interrupt when there is genuine danger, while secondary guidance should sit quietly in the sidebar.',
        ],
      },
      {
        heading: 'Pragmatic lessons from community hospitals',
        body: [
          'In district hospitals and resource-limited clinics, high patient loads and shared workstations demand simple, robust tools. Systems that offer offline resilience, fast barcode scanning, and uncluttered summaries prove that clean design is essential everywhere—not just in high-budget academic medical centers.',
        ],
      },
    ],
  },
  {
    slug: 'terminology-strategy-snomed-loinc-icd',
    title: 'Making Sense of Medical Codes: A Practical Guide to SNOMED, LOINC, and ICD',
    excerpt:
      'Medical coding can feel overwhelming. Learn how clinical terminologies work together—using SNOMED for bedside care, LOINC for lab tests, and ICD for diagnostics and reporting.',
    category: 'Standards',
    author: 'InteropMed Standards Working Group',
    publishedAt: '2026-06-10T00:00:00.000Z',
    sections: [
      {
        heading: 'Why one code system isn’t enough',
        body: [
          'Healthcare is too nuanced for a single coding system. A doctor documenting a physical exam has very different needs than a laboratory technician analyzing a blood sample or an epidemiologist tracking disease spread.',
          'To make health data interoperable, international healthcare relies on three complementary systems that each excel at a specific job.',
        ],
      },
      {
        heading: 'The distinct roles of the Big Three',
        body: [
          'SNOMED CT is the clinical vocabulary of medicine. It contains hundreds of thousands of terms with relationships between anatomy, clinical findings, and surgical procedures. It is designed for doctors and nurses capturing medical notes at the bedside.',
          'LOINC identifies observations and measurements. Every routine lab test—from hemoglobin levels to blood pressure panels—has a distinct LOINC code that specifies what was measured, in which specimen, and with which units.',
          'ICD-10 and ICD-11 are statistical classifications created by the World Health Organization. They group diseases into broad categories for tracking mortality, morbidity trends, and health policy.',
        ],
      },
      {
        heading: 'Bringing them together in clinical practice',
        body: [
          'When a patient visits a clinic with asthma, the doctor records the diagnosis using SNOMED CT. When the doctor orders a spirometry test, the order uses LOINC. When the hospital submits diagnostic statistics to health authorities, the record translates into ICD-10. Understanding these relationships is fundamental for any health informatician.',
        ],
      },
    ],
  },
  {
    slug: 'digital-health-implementation-principles',
    title: 'The Human Side of Hospital Tech: Why Digital Health Rollouts Succeed or Stumble',
    excerpt:
      'Software is rarely the reason hospital technology projects fail. Success comes from listening to clinicians, finding departmental champions, and rolling out in manageable phases.',
    category: 'Implementation',
    author: 'Digital Health Implementation Advisory',
    publishedAt: '2026-06-18T00:00:00.000Z',
    sections: [
      {
        heading: 'Technology is only twenty percent of the project',
        body: [
          'When hospital digital transformation projects fall short, leadership often blames the vendor or the servers. In reality, nearly every project failure traces back to workflow disruption, poor communication, or lack of physician engagement.',
          'Healthcare is an intense human environment. If software slows down emergency room intake or makes ward rounds take twice as long, staff will understandably resist it.',
        ],
      },
      {
        heading: 'Shadowing workflows before writing a single line of code',
        body: [
          'Before configuring an electronic record system, implementation leads should spend days shadowing doctors, nurses, ward clerks, and pharmacists. How do paper charts currently move from triage to the bed? Where are the bottlenecks?',
          'Understanding current daily reality allows you to build digital tools that actually relieve pain points rather than simply digitizing inefficient paperwork.',
        ],
      },
      {
        heading: 'Clinical champions make all the difference',
        body: [
          'The most valuable asset in any hospital deployment is a respected senior clinician who champions the change. When colleagues see a head nurse or staff physician using the system and offering at-the-elbow help, skepticism quickly turns into confidence.',
        ],
      },
    ],
  },
  {
    slug: 'medical-imaging-dicom-fhir-integration',
    title: 'Connecting Radiology to the Rest of the Hospital: DICOM Meets Modern FHIR',
    excerpt:
      'Radiology departments produce high-resolution imaging that often stays trapped in PACS silos. Here is how modern DICOMweb and FHIR imaging studies connect scans directly to the patient chart.',
    category: 'Technology',
    author: 'Medical Imaging & Architecture Working Group',
    publishedAt: '2026-06-25T00:00:00.000Z',
    sections: [
      {
        heading: 'The traditional radiology island',
        body: [
          'For decades, radiology departments have operated on their own specialized systems known as Picture Archiving and Communication Systems (PACS). While PACS handles massive CT and MRI files brilliantly using the DICOM standard, these systems rarely communicated smoothly with standard hospital electronic records.',
          'Clinicians outside the radiology department were often forced to walk to a dedicated workstation or wait for a printed summary to see diagnostic scans.',
        ],
      },
      {
        heading: 'DICOMweb: Bringing images to the web browser',
        body: [
          'DICOMweb brings medical imaging into the modern internet era. By standardizing image retrieval over HTTP protocols, doctors can now view cross-sectional imaging directly on hospital tablets and web workstations without downloading heavy desktop clients.',
        ],
      },
      {
        heading: 'Connecting images to the longitudinal chart',
        body: [
          'By linking the FHIR ImagingStudy resource to the patient encounter, any clinician reviewing a patient history can view the radiologist interpretation alongside an instant link to the scan itself. This unified view saves vital minutes during surgical planning and emergency care.',
        ],
      },
    ],
  },
]

async function seed() {
  await client.connect()
  console.log('Connected to database.')

  for (const art of SEED_ARTICLES) {
    const content = art.sections
      .map((sec) => `## ${sec.heading}\n\n${sec.body.join('\n\n')}`)
      .join('\n\n')

    const tags = [
      art.category,
      'Healthcare Interoperability',
      'Clinical Informatics',
      ...(art.slug.includes('fhir') ? ['FHIR R4'] : []),
      ...(art.slug.includes('hl7') ? ['HL7 v2'] : []),
      ...(art.slug.includes('dicom') ? ['DICOM', 'Imaging'] : []),
      ...(art.slug.includes('terminology') ? ['LOINC', 'SNOMED CT', 'ICD-10'] : []),
    ]

    const publishedDate = new Date(art.publishedAt)

    const query = `
      INSERT INTO "Article" (
        "id",
        "title",
        "slug",
        "excerpt",
        "content",
        "type",
        "category",
        "tags",
        "status",
        "viewCount",
        "likes",
        "metaDescription",
        "metaKeywords",
        "createdAt",
        "updatedAt",
        "publishedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), $14
      )
      ON CONFLICT ("slug") DO UPDATE SET
        "title" = EXCLUDED."title",
        "excerpt" = EXCLUDED."excerpt",
        "content" = EXCLUDED."content",
        "type" = EXCLUDED."type",
        "category" = EXCLUDED."category",
        "tags" = EXCLUDED."tags",
        "status" = EXCLUDED."status",
        "metaDescription" = EXCLUDED."metaDescription",
        "publishedAt" = EXCLUDED."publishedAt",
        "updatedAt" = NOW()
      RETURNING "id", "slug", "title"
    `

    const id = `art_${art.slug.replace(/[^a-z0-9]/g, '_').slice(0, 24)}`
    const res = await client.query(query, [
      id,
      art.title,
      art.slug,
      art.excerpt,
      content,
      'insight',
      art.category,
      tags,
      'published',
      0,
      0,
      art.excerpt,
      tags,
      publishedDate,
    ])

    console.log(`[UPSERTED] ${res.rows[0].slug} -> ${res.rows[0].title}`)
  }

  const countRes = await client.query('SELECT count(*) FROM "Article" WHERE status = $1', ['published'])
  console.log(`\nSUCCESS: Total published articles in database "Article" table: ${countRes.rows[0].count}`)

  await client.end()
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
