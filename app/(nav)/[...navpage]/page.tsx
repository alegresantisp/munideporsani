import { navPageServerRepository } from "@/services/navigation/navPage.server.repository";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageBlocksRenderer } from "@/components/navigation/PageBlocksRenderer";

export const revalidate = 30;

export default async function NavPage({ params }: { params: Promise<{ navpage: string[] }> }) {
  const { navpage } = await params;
  const segments = navpage;

  const path = `/${segments.join("/")}`;
  const page = await navPageServerRepository.getByPath(path);
  if (!page) return notFound();

  const layout = page.layout ?? "hero-text";
  const hasBlocks = (page.blocks?.length ?? 0) > 0;
  const firstBlockIsHero = hasBlocks && page.blocks?.[0].type === "hero";

  const renderBody = () => {
    const body = page.body ?? "";
    const html = body.replace(/\n/g, "<br />");
    if (layout === "simple") {
      return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    if (layout === "hero-gallery") {
      return (
        <div className="space-y-6">
          {body && <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: html }} />}
        </div>
      );
    }
    return body ? <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: html }} /> : null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
      {!hasBlocks && (
        <>
          <div className="space-y-2">
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
