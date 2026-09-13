import { PrismaClient } from "@prisma/client";
import { projects } from "../data/projects.js";
import { experience } from "../data/experience.js";
import { siteConfig } from "../config/site.js";

const prisma = new PrismaClient();

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const categoryNames = [
    "Packages",
    "Business Cards",
    "Logo",
    "Banner",
    "Kelk",
    "Advertising",
  ];

  const categories = {};
  for (let i = 0; i < categoryNames.length; i += 1) {
    const name = categoryNames[i];
    const category = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name, sortOrder: i },
      create: { name, slug: slugify(name), sortOrder: i },
    });
    categories[name] = category;
  }

  for (const project of projects) {
    const category = categories[project.category];
    if (!category) {
      throw new Error(`Missing category ${project.category} for ${project.title}`);
    }

    const tools = project.tools.split("|").filter(Boolean);
    const saved = await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        title: project.title,
        description: project.description,
        client: project.client,
        tools,
        coverPath: project.image,
        featured: project.featured,
        featuredOrder: project.featuredOrder,
        status: "published",
        categoryId: category.id,
      },
      create: {
        slug: project.slug,
        title: project.title,
        description: project.description,
        client: project.client,
        tools,
        coverPath: project.image,
        featured: project.featured,
        featuredOrder: project.featuredOrder,
        status: "published",
        categoryId: category.id,
      },
    });

    await prisma.projectMedia.deleteMany({ where: { projectId: saved.id } });
    if (project.media?.length) {
      await prisma.projectMedia.createMany({
        data: project.media.map((mediaPath, index) => ({
          projectId: saved.id,
          path: mediaPath,
          alt: project.title,
          sortOrder: index,
        })),
      });
    }
  }

  await prisma.experience.deleteMany();
  for (let i = 0; i < experience.length; i += 1) {
    const item = experience[i];
    await prisma.experience.create({
      data: {
        position: item.position,
        company: item.company,
        period: item.period,
        bullets: item.desc,
        sortOrder: i,
      },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      siteName: siteConfig.siteName,
      personName: siteConfig.personName,
      tagline: siteConfig.tagline,
      headline: siteConfig.headline,
      heroSupporting: siteConfig.heroSupporting,
      aboutBio: siteConfig.aboutBio,
      locations: siteConfig.locations,
      tools: siteConfig.tools,
      phone: siteConfig.contact.phone,
      phoneDisplay: siteConfig.contact.phoneDisplay,
      email: siteConfig.contact.email,
      location: siteConfig.contact.location,
      linkedin: siteConfig.socials.linkedin,
      linkedinHandle: siteConfig.socials.linkedinHandle,
      github: siteConfig.socials.github,
      facebook: siteConfig.socials.facebook,
      resumePath: siteConfig.resumePath,
      ogImagePath: siteConfig.ogImagePath,
      canonicalUrl: siteConfig.canonicalUrl,
      gaId: siteConfig.gaId,
    },
    create: {
      id: 1,
      siteName: siteConfig.siteName,
      personName: siteConfig.personName,
      tagline: siteConfig.tagline,
      headline: siteConfig.headline,
      heroSupporting: siteConfig.heroSupporting,
      aboutBio: siteConfig.aboutBio,
      locations: siteConfig.locations,
      tools: siteConfig.tools,
      phone: siteConfig.contact.phone,
      phoneDisplay: siteConfig.contact.phoneDisplay,
      email: siteConfig.contact.email,
      location: siteConfig.contact.location,
      linkedin: siteConfig.socials.linkedin,
      linkedinHandle: siteConfig.socials.linkedinHandle,
      github: siteConfig.socials.github,
      facebook: siteConfig.socials.facebook,
      resumePath: siteConfig.resumePath,
      ogImagePath: siteConfig.ogImagePath,
      canonicalUrl: siteConfig.canonicalUrl,
      gaId: siteConfig.gaId,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
