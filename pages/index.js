import Head from "next/head";
import Container from "../components/Container";
import FeaturedProjects from "../components/FeaturedProjects";
import { Hero } from "../components/Hero";

export default function Home({ projects, settings }) {
  return (
    <Container settings={settings}>
      <Head>
        <link rel="preload" as="image" href="/images/profile.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: settings.personName,
              url: settings.canonicalUrl,
              jobTitle: settings.tagline,
              worksFor: {
                "@type": "Organization",
                name: settings.siteName,
              },
            }),
          }}
        />
      </Head>
      <Hero settings={settings} />
      <FeaturedProjects projects={projects} />
    </Container>
  );
}

export async function getServerSideProps() {
  const { getFeaturedProjects, getSiteSettings } = await import("../lib/content");
  const [projects, settings] = await Promise.all([
    getFeaturedProjects(),
    getSiteSettings(),
  ]);
  return { props: { projects, settings } };
}
