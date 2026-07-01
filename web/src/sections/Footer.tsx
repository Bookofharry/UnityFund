import { footer } from '../data/landing';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white" role="contentinfo">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            {/* Logo mark */}
            <div className="mb-4 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="10" cy="14" r="8" fill="#4f46e5" fillOpacity="0.85" />
                <circle cx="18" cy="14" r="8" fill="#1a2b6e" fillOpacity="0.85" />
                <circle cx="14" cy="14" r="4" fill="#6366f1" fillOpacity="0.6" />
              </svg>
              <span className="font-bold text-navy-800">{footer.brand}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">{footer.tagline}</p>
            <a
              href={`mailto:${footer.email}`}
              className="mt-4 inline-block text-sm text-indigo-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              {footer.email}
            </a>
          </div>

          {/* Link columns */}
          {footer.columns.map(({ heading, links }) => (
            <div key={heading}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                {heading}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 transition-colors hover:text-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-sm text-gray-400 sm:flex-row">
          <p>{footer.copyright}</p>
          <p>{footer.credit}</p>
        </div>
      </div>
    </footer>
  );
}
