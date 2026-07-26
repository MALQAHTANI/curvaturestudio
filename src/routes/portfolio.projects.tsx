import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { isVideo } from "@/lib/media";
import { Lightbox, type LightboxItem } from "@/components/lightbox";

export const Route = createFileRoute("/portfolio/projects")({
  head: () => ({
    meta: [
      { title: "Selected Work — Curvature Studio" },
      { name: "description", content: "Selected work from Curvature Studio — commercial, automotive, and cinematic productions." },
      { property: "og:title", content: "Selected Work — Curvature Studio" },
      { property: "og:description", content: "Selected work from Curvature Studio." },
    ],
  }),
  component: ProjectsGallery,
});

const wix = (id: string) =>
  `https://static.wixstatic.com/media/${id}/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/${id}`;

const REFERENCE_TILES: { id: string; title: string; src: string }[] = ([
  ["mb-snd-2025", "MB SND 2025", "f3dbf9_b0d653724924428e8536d3a37763bbd2~mv2.jpg"],
  ["mb-the-concept-cla", "MB — THE CONCEPT CLA", "f3dbf9_6665de1f31d548468531414b0d766fdd~mv2.jpg"],
  ["mb-eqg-landing-in-alula", "MB EQG — Landing in AlUla", "f3dbf9_5bb37d25ad1440fdbeb267de61a953d9~mv2.jpg"],
  ["mb-snd-2022", "MB SND 2022", "f3dbf9_30a49fabe45d450e82ac9038dc06c6f4~mv2.jpg"],
  ["cle-ludovic-ballouard", "CLE — Ludovic Ballouard", "f3dbf9_1e6bd2c4d5974321bbe95d2a2b49d993~mv2.jpg"],
  ["porsche-green-roof-alula", "Porsche Green Roof AlUla", "f3dbf9_530f9dbd54714b13b28d30d8b190ad69~mv2.jpg"],
  ["rolls-royce-rules-rewritten", "Rolls Royce — Rules Rewritten", "f3dbf9_64248d8450a848719df698e3e82a9a62~mv2.jpg"],
  ["project-n-albalad", "Project N — Albalad", "f3dbf9_3e49410c0bdf4722a946539effac2ef9~mv2.jpg"],
  ["geely-starray", "Geely — Starray", "f3dbf9_d2f63beb28db4456bd73cb2268abf6be~mv2.jpg"],
  ["mercedes-benz-snd-2024", "Mercedes-Benz — SND 2024", "f3dbf9_d5562ddf2fb54309bd71ec18872bfa86~mv2.jpg"],
  ["project-n-m2", "Project N — M2", "f3dbf9_22b204ef607549a496322d9619126150~mv2.jpg"],
  ["flashing-light-mb-flagship", "Flashing Light — MB Flagship", "f3dbf9_36eb71044a934622be033e78bcfd2d09~mv2.jpg"],
  ["mercedes-benz-snd", "Mercedes-Benz SND", "f3dbf9_258ca4a90b744b84b6265e6146c97e4b~mv2.jpg"],
  ["project-n-range-rover", "Project N — Range Rover", "f3dbf9_8917ed192046412c9d2d7d4e50f88afa~mv2.jpg"],
  ["sindi-collection", "Sindi Collection", "f3dbf9_d3afc81c21d04c3c8e43469b2345924e~mv2.jpg"],
  ["arabflex", "ArabFlex", "f3dbf9_21b92c72ece24924af84a258658641cd~mv2.jpg"],
  ["kaust", "KAUST", "f3dbf9_4ac7082b92a64f8eb5b6c98cdd4cfa31~mv2.jpg"],
  ["mb-eqe-nature-elements", "MB EQE — Nature Elements", "f3dbf9_2512dedeff324300a324078f664cb6fe~mv2.jpg"],
  ["maserati-mc20", "Maserati MC20", "f3dbf9_56d2b1e2ea0c4a0fa8e6557b0cb8308a~mv2.jpg"],
  ["cartier-jeddah-boutique", "Cartier Jeddah Boutique", "f3dbf9_04ec51c31466489998ca8e030eaf20cb~mv2.jpg"],
  ["mb-glb-campaign-2021", "MB GLB Campaign 2021", "f3dbf9_b1d012456cab499a94bef9b5dc07e02a~mv2.jpg"],
  ["besht-mercedes-benz-jaco", "Besht — Mercedes-Benz (JACO)", "f3dbf9_635821749d384c1ba632cc4a893f5dbc~mv2.jpg"],
  ["mb-s-class-all-white", "MB S-Class — All White", "f3dbf9_d3a333333ede414b83c41af49bc3e48e~mv2.jpg"],
  ["cartier-jeddah-exhibit", "Cartier Jeddah Exhibit", "f3dbf9_09a0ea5852ee43b48cce111f91b0ca8a~mv2.jpg"],
  ["haval-h6-gt-all-red", "Haval H6-GT — All Red", "f3dbf9_9771d7d2ab7c411a842ab3967cc59747~mv2.jpg"],
  ["mb-maybach-al-balad", "MB Maybach × AL-Balad", "f3dbf9_5a1a4206c9d849f38efed838c92a53b5~mv2.jpg"],
  ["haval-h6-the-beach", "Haval H6 — The Beach", "f3dbf9_db3f8397d7304ec8b7c61c1789c5bb49~mv2.jpg"],
  ["careem-visual-content-library", "Careem Visual Content Library", "f3dbf9_b43fd35a380140f6b7affb428d6cbf35~mv2.jpg"],
  ["alj-service-center-toyota", "ALJ Service Center — Toyota", "f3dbf9_0d0ee8f653cc4cc39c99017b689f68a0~mv2.jpg"],
  ["haval-jolion", "Haval Jolion", "f3dbf9_ee5a98b7047e434eac6bdc340112ab0d~mv2.jpg"],
  ["romoz-campaign", "Romoz Campaign", "f3dbf9_16bc686fb11641fd86cce32daa70f158~mv2.jpg"],
  ["tve", "TVE", "f3dbf9_f32edc96214b49ec9abbb18818eb477d~mv2.jpg"],
  ["al-guthmi-fabrics", "AL-Guthmi Fabrics", "f3dbf9_9a2d1141c6aa4ca2834062586132b48d~mv2.jpg"],
  ["mb-jaco-sdf", "MB (JACO) × SDF", "f3dbf9_ccd0021e6bcf4f31835ac4bc4913a7d4~mv2.jpg"],
  ["the-escape", "The Escape", "f3dbf9_8f34728c9b3849059d37b033775bbe7a~mv2.jpg"],
  ["tank-500-offroad", "Tank 500 — Offroad", "f3dbf9_9dc3dc315dc24a5ebcfd8e3b1a02574f~mv2.jpg"],
  ["haval-h6-gt-studio", "Haval H6-GT — Studio", "f3dbf9_4405738f267b47558446db630bbbb3fa~mv2.jpg"],
  ["tank-500-city", "Tank 500 — City", "f3dbf9_d90da79edad44c39b74f81862fa02969~mv2.jpg"],
  ["mg-t60-visuals-library", "MG T60 Visuals Library", "f3dbf9_c3746652261949ea96c1871faef31e8c~mv2.jpg"],
  ["mb-eqg-jeddah-private-viewing", "MB EQG — Jeddah Private Viewing", "f3dbf9_28e59445387249a291010828404766b2~mv2.jpg"],
  ["mb-gle-2019-campaign", "MB GLE 2019 Campaign", "f3dbf9_cc2d85429a1741be823a133841ab18f5~mv2.jpg"],
  ["mb-eqs-al-ula", "MB EQS × AL-Ula", "f3dbf9_4fdc9d8b45794ffe8eee4165f600984e~mv2.jpg"],
  ["mercedes-benz-gls-campaign-mena", "Mercedes-Benz GLS Campaign MENA", "f3dbf9_73b4f979ba7249df9ec64ab93489494b~mv2.jpg"],
  ["maserati-quattroporte-2022", "Maserati Quattroporte 2022", "f3dbf9_be106f42e7654f5e8b18f7924c226350~mv2.jpg"],
  ["maserati-hybrid-2022", "Maserati Hybrid 2022", "f3dbf9_d7b944e2475048de8009b460dd8cca3d~mv2.jpg"],
  ["ford-2006-gt-2019-private-client", "Ford 2006 GT (2019) — Private Client", "f3dbf9_4bd6c032e73c4b23905144f9a524a269~mv2.png"],
  ["mercedes-benz-ppf-detailing", "Mercedes-Benz PPF & Detailing", "f3dbf9_26261153774d4af8ac20f93d48f53940~mv2.jpg"],
  ["maserati-gcc", "Maserati GCC", "f3dbf9_6863bb5dae8647b5b08f1bf12b4aca1f~mv2.jpg"],
  ["bmw-m-experience-bahrain", "BMW M-Experience Bahrain", "f3dbf9_017611754ebb4964a99e30189b889f8b~mv2.jpg"],
  ["bmw-8-series-bmw-sa", "BMW 8 Series — BMW SA", "f3dbf9_90d22bdd3789461485b5e7bab2c6adfb~mv2.jpg"],
  ["industrial-projects", "Industrial Projects", "f3dbf9_306b3bd6af864fe98f83027643d83403~mv2.jpg"],
  ["seraj-sanad-collection", "Seraj Sanad Collection", "f3dbf9_c88e934790cc47ecaee0e7cae4217020~mv2.jpg"],
  ["street-signs-saudi-signs", "Street Signs — Saudi Signs", "f3dbf9_edbe2e16f17944d78d70f69768780766~mv2.jpg"],
] as [string, string, string][]).map(([id, title, img]) => ({ id, title, src: wix(img) }));

type Tile = {
  id: string;
  title: string;
  category?: string;
  description?: string;
  coverImage: string;
  images: string[];
};

function ProjectsGallery() {
  const [dbItems, setDbItems] = useState<any[]>([]);
  const [active, setActive] = useState<LightboxItem | null>(null);
  useEffect(() => {
    supabase.from("projects").select("id,title,description,cover_image,media_urls,sort_order,created_at")
      .eq("published", true).order("sort_order", { ascending: true }).order("created_at", { ascending: false })
      .then(({ data }) => setDbItems((data as any[])?.map(d => ({ ...d, cover_image: d.cover_image ?? d.media_urls?.[0] })) ?? []));
  }, []);
  const dbTiles: Tile[] = dbItems
    .map((it) => {
      const cover = it.cover_image ?? it.media_urls?.[0] ?? null;
      const images: string[] = Array.from(
        new Set([cover, ...((it.media_urls as string[]) ?? [])].filter(Boolean) as string[]),
      );
      return {
        id: it.id,
        title: it.title,
        category: "PROJECT",
        description: it.description ?? undefined,
        coverImage: cover as string,
        images,
      };
    })
    .filter((t) => !!t.coverImage);
  const tiles: Tile[] = [
    ...dbTiles,
    ...REFERENCE_TILES.map((t) => ({
      id: t.id,
      title: t.title,
      category: "SELECTED WORK",
      coverImage: t.src,
      images: [t.src],
    })),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 md:px-12 pt-40 pb-10">
        <p className="text-[11px] text-muted-foreground mb-4">PORTFOLIO / SELECTED WORK</p>
        <h1 className="text-3xl md:text-5xl" style={{ fontFamily: "Jost, sans-serif", letterSpacing: "-0.02em" }}>
          Selected Work
        </h1>
      </section>
      <section className="border-t border-border px-6 md:px-12 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tiles.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setActive({ title: t.title, category: t.category, description: t.description, images: t.images })
              }
              aria-label={`Open gallery: ${t.title}`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-white/5 text-left"
            >
              {isVideo(t.coverImage) ? (
                <video src={t.coverImage} className="w-full h-full object-cover" muted loop playsInline autoPlay />
              ) : (
                <img
                  src={t.coverImage}
                  alt={t.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
              )}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/85 to-transparent px-4 pb-4 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="block text-xs md:text-sm text-foreground" style={{ fontFamily: "Jost, sans-serif" }}>
                  {t.title}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
      <Lightbox item={active} onClose={() => setActive(null)} />
      <SiteFooter />
    </div>
  );
}