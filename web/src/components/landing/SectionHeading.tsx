interface Props {
  heading: string;
  subheading?: string;
  align?: 'left' | 'center';
  light?: boolean; // true = white text (dark backgrounds)
}

export function SectionHeading({ heading, subheading, align = 'center', light = false }: Props) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <h2
        className={`text-display-m font-bold leading-tight tracking-tight ${
          light ? 'text-white' : 'text-navy-800'
        }`}
        // Preserve intentional newlines in heading strings
        style={{ whiteSpace: 'pre-line' }}
      >
        {heading}
      </h2>
      {subheading && (
        <p
          className={`mt-4 text-lg leading-relaxed ${
            light ? 'text-indigo-200' : 'text-gray-500'
          } ${align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}
        >
          {subheading}
        </p>
      )}
    </div>
  );
}
