import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

export default function Breadcrumbs({ items, baseUrl }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://cpsmaterialdeportivo.es';

  return (
    <>
      <nav 
        className="flex items-center gap-2 text-sm md:text-base text-gray-600"
        aria-label="Breadcrumb"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <span key={`${item.href}-${index}`} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  /
                </span>
              )}
              {isLast ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.label,
              item: `${siteUrl}${item.href}`,
            })),
          }),
        }}
      />
    </>
  );
}
