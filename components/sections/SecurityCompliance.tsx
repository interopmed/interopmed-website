const features = [
  {
    title: 'Encrypted exchange',
    description: 'Protect data in transit and at rest with deployment patterns designed for regulated health environments.',
  },
  {
    title: 'Identity-aware access',
    description: 'Support OAuth, OpenID Connect, role-based access, and service-level authorization strategies.',
  },
  {
    title: 'Traceable operations',
    description: 'Capture audit events for access, transformation, publication, configuration, and exception workflows.',
  },
  {
    title: 'Compliance alignment',
    description: 'Map platform controls to HIPAA, HITECH, GDPR, Privacy Act, and customer vendor-risk expectations.',
  },
]

export default function SecurityCompliance() {
  return (
    <section className="bg-slate-950 py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">
              Trust layer
            </p>
            <h2 className="text-3xl font-bold">
              Security and governance built into the data path.
            </h2>
            <p className="mt-6 text-base leading-7 text-slate-300">
              InteropMed treats compliance as operational design: policy, auditability, validation, and review workflows live close to the clinical data they protect.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-slate-800 bg-slate-900 p-6"
              >
                <h3 className="mb-3 text-xl font-bold">
                  {feature.title}
                </h3>
                <p className="text-sm leading-6 text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-lg border border-slate-800 bg-slate-900 p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-4">
            {['HIPAA', 'HITECH', 'GDPR', 'Privacy Act AU'].map((name) => (
              <div key={name} className="rounded-lg bg-slate-950 p-5 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
                  Aligned
                </p>
                <p className="mt-2 text-lg font-bold">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
