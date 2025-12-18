import { navPageServerRepository } from "@/services/navigation/navPage.server.repository";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageBlocksRenderer } from "@/components/navigation/PageBlocksRenderer";

export const revalidate = 30;

export default async function TramitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = `/tramites/${slug}`;
  const page = await navPageServerRepository.getByPath(path);
  if (!page) return notFound();

  const layout = page.layout ?? "hero-text";
  const hasBlocks = (page.blocks?.length ?? 0) > 0;
  const firstBlockIsHero = hasBlocks && page.blocks?.[0].type === "hero";

  const renderBody = () => {
    if (layout === "simple") {
      return (
        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: (page.body ?? "").replace(/\n/g, "<br />") }} />
      );
    }
    if (layout === "hero-gallery") {
      return (
        <div className="space-y-6">
          {page.body && (
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: page.body.replace(/\n/g, "<br />") }} />
          )}
        </div>
      );
    }
    return page.body ? (
      <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: page.body.replace(/\n/g, "<br />") }} />
    ) : null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
      {!hasBlocks && (
        <>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Trámites</p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{page.title}</h1>
            {page.subtitle && <p className="text-lg text-slate-600">{page.subtitle}</p>}
          </div>
          {page.imageUrl && (
            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-slate-100">
              <Image src={page.imageUrl} alt={page.title} fill className="object-cover" />
            </div>
          )}
          {renderBody()}
        </>
      )}

      {hasBlocks && (
        <div className="space-y-6">
          {!firstBlockIsHero && (
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Trámites</p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{page.title}</h1>
              {page.subtitle && <p className="text-lg text-slate-600">{page.subtitle}</p>}
            </div>
          )}
          <PageBlocksRenderer blocks={page.blocks} />
        </div>
      )}
    </div>
  );
}
