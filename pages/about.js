import PageNameSection from "../components/PageNameSection";
import Timeline from "../components/Timeline";
import { RoughNotationGroup } from "react-rough-notation";
import AnimatedHeadline from "../components/AnimatedHeadline";
import ToolCard from "../components/ToolCard";
import Container from "../components/Container";

export default function About({ experience, settings }) {
  const colors = ["#f59e0b", "#3b82f6", "#f43f5e", "#1d4ed8"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const tools = settings.tools || [];

  return (
    <Container settings={settings}>
      <div className="mt-10">
        <PageNameSection title={"Know my journey!"} />
        <section className="flex w-full mx-auto my-8">
          <div className="grid-rows-1 w-full">
            <div className="flex grid lg:grid-cols-1 md:grid-cols-1 sm:grid-cols-1">
              <h1 className="font-display text-5xl md:text-7xl text-gray-600">
                Hello! I&apos;m
              </h1>
              <div className="w-2/3">
                <RoughNotationGroup show={true}>
                  <AnimatedHeadline color={color}>
                    <h1 className="font-display text-4xl md:text-7xl font-bold text-black my-2">
                      {settings.personName}
                    </h1>
                  </AnimatedHeadline>
                </RoughNotationGroup>
              </div>

              <div className="mt-8">
                <p className="pb-6 text-lg text-gray-700 whitespace-pre-line">
                  {settings.aboutBio}
                </p>
              </div>

              <div className="mt-16">
                <h2 className="text-2xl text-gray-800 font-semibold mb-4 mt-4">
                  Location
                </h2>
                {(settings.locations || []).map((location) => (
                  <p key={location} className="italic text-lg text-gray-700">
                    {location}
                  </p>
                ))}
              </div>
              <div className="mt-16">
                <h2 className="text-2xl text-gray-800 font-semibold mb-4 mt-4">
                  Tech Stack
                </h2>
                <div className="flex grid lg:grid-cols-12 md:grid-cols-8 sm:grid-cols-3 grid-cols-3">
                  {tools.map((tool) => (
                    <ToolCard key={tool} tool={tool} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex grid lg:grid-cols-1 md:grid-cols-1 sm:grid-cols-1">
              <Timeline experience={experience} />
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}

export async function getServerSideProps() {
  const { getExperience, getSiteSettings } = await import("../lib/content");
  const [experience, settings] = await Promise.all([
    getExperience(),
    getSiteSettings(),
  ]);
  return { props: { experience, settings } };
}
