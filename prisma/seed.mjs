import { PrismaClient } from "@prisma/client";
import { projects } from "../data/projects.js";
import { experience } from "../data/experience.js";
import { siteConfig } from "../config/site.js";

const prisma = new PrismaClient();

/** @type {'safe' | 'fresh'} */
const seedMode =
  process.env.SEED_MODE === "fresh" ? "fresh" : "safe";
const isFresh = seedMode === "fresh";

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log(`Seed mode: ${seedMode}`);

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

  const savedProjects = {};
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
    savedProjects[project.slug] = saved;

    if (isFresh) {
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
    } else {
      const mediaCount = await prisma.projectMedia.count({
        where: { projectId: saved.id },
      });
      if (mediaCount === 0 && project.media?.length) {
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
  }

  const savedExperience = [];
  if (isFresh) {
    // Destructive demo reset — only when SEED_MODE=fresh
    await prisma.metric.updateMany({ data: { experienceId: null } });
    await prisma.achievement.updateMany({ data: { experienceId: null } });
    await prisma.experience.deleteMany();
    for (let i = 0; i < experience.length; i += 1) {
      const item = experience[i];
      const row = await prisma.experience.create({
        data: {
          position: item.position,
          company: item.company,
          period: item.period,
          bullets: item.desc,
          sortOrder: i,
        },
      });
      savedExperience.push(row);
    }
  } else {
    for (let i = 0; i < experience.length; i += 1) {
      const item = experience[i];
      const existing = await prisma.experience.findFirst({
        where: {
          company: item.company,
          position: item.position,
          period: item.period,
        },
      });
      const row = existing
        ? await prisma.experience.update({
            where: { id: existing.id },
            data: {
              bullets: item.desc,
              sortOrder: i,
            },
          })
        : await prisma.experience.create({
            data: {
              position: item.position,
              company: item.company,
              period: item.period,
              bullets: item.desc,
              sortOrder: i,
            },
          });
      savedExperience.push(row);
    }
  }

  const existingSettings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
  });
  if (!existingSettings || isFresh) {
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: isFresh
        ? {
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
          }
        : {},
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

  // --- Professional archive seed (idempotent) ---

  const metricGroupDefs = [
    {
      name: "Sales Performance",
      slug: "sales-performance",
      description: "E-commerce and commercial outcomes.",
      sortOrder: 0,
    },
    {
      name: "Technical Operations",
      slug: "technical-operations",
      description: "IT support and operational reliability.",
      sortOrder: 1,
    },
    {
      name: "Career",
      slug: "career",
      description: "Career progression and tenure signals.",
      sortOrder: 2,
    },
    {
      name: "Design Portfolio",
      slug: "design-portfolio",
      description: "Design deliverables and brand work volume.",
      sortOrder: 3,
    },
  ];

  const groups = {};
  for (const def of metricGroupDefs) {
    groups[def.slug] = await prisma.metricGroup.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        description: def.description,
        sortOrder: def.sortOrder,
        visibility: "public",
      },
      create: {
        ...def,
        visibility: "public",
      },
    });
  }

  const firstProject =
    savedProjects[Object.keys(savedProjects)[0]] ||
    (await prisma.project.findFirst());
  const firstExperience = savedExperience[0] || null;

  const achievementDefs = [
    {
      title: "Launched a complete brand identity system",
      slug: "launched-brand-identity-system",
      description:
        "Designed and delivered a full brand identity—logo, packaging cues, and application guidelines—for a client launch.",
      type: "design",
      category: "branding",
      featured: true,
      sortOrder: 0,
      status: "published",
      projectId: firstProject?.id ?? null,
      experienceId: null,
      date: new Date("2023-06-01"),
    },
    {
      title: "Grew online sales through storefront optimization",
      slug: "grew-online-sales-storefront",
      description:
        "Improved listing quality, campaign structure, and conversion paths across Amazon and Noon seller channels.",
      type: "sales",
      category: "ecommerce",
      featured: true,
      sortOrder: 1,
      status: "published",
      projectId: null,
      experienceId: firstExperience?.id ?? null,
      date: new Date("2024-01-15"),
    },
    {
      title: "Completed a major systems migration",
      slug: "completed-major-systems-migration",
      description:
        "Migrated core productivity and collaboration tooling with minimal downtime and documented runbooks for the team.",
      type: "technical",
      category: "operations",
      featured: false,
      sortOrder: 2,
      status: "published",
      projectId: null,
      experienceId: firstExperience?.id ?? null,
      date: new Date("2022-11-01"),
    },
    {
      title: "Reduced operational processing time",
      slug: "reduced-operational-processing-time",
      description:
        "Streamlined ticket triage and POS/CRM handoffs, cutting average resolution overhead for recurring requests.",
      type: "operations",
      category: "efficiency",
      featured: true,
      sortOrder: 3,
      status: "published",
      projectId: null,
      experienceId: null,
      date: new Date("2024-06-01"),
    },
  ];

  const achievements = {};
  for (const def of achievementDefs) {
    achievements[def.slug] = await prisma.achievement.upsert({
      where: { slug: def.slug },
      update: {
        title: def.title,
        description: def.description,
        type: def.type,
        category: def.category,
        featured: def.featured,
        sortOrder: def.sortOrder,
        status: def.status,
        projectId: def.projectId,
        experienceId: def.experienceId,
        date: def.date,
      },
      create: def,
    });
  }

  // Stable metric keys via name + group slug composite — upsert by finding existing
  const metricDefs = [
    {
      key: "years-experience",
      name: "Years Experience",
      label: "Years of professional experience",
      value: "7",
      valueNumeric: 7,
      type: "count",
      suffix: "+",
      category: "career",
      featured: true,
      sortOrder: 0,
      visibility: "public",
      period: null,
      trendPreference: "higher_is_better",
      previousNumeric: 6,
      metricGroupSlug: "career",
      projectId: null,
      experienceId: null,
      achievementId: null,
    },
    {
      key: "monthly-revenue",
      name: "Monthly Revenue",
      label: "Monthly online store revenue",
      value: "34,500",
      valueNumeric: 34500,
      type: "currency",
      prefix: "AED ",
      unit: "AED",
      compact: true,
      category: "sales",
      featured: true,
      sortOrder: 0,
      visibility: "public",
      period: "month",
      trendPreference: "higher_is_better",
      targetNumeric: 40000,
      baselineNumeric: 15000,
      metricGroupSlug: "sales-performance",
      projectId: null,
      experienceId: null,
      achievementId: achievements["grew-online-sales-storefront"]?.id ?? null,
      series: [
        { date: "2024-01-01", valueNumeric: 18000, label: "Jan" },
        { date: "2024-02-01", valueNumeric: 21500, label: "Feb" },
        { date: "2024-03-01", valueNumeric: 26200, label: "Mar" },
        { date: "2024-04-01", valueNumeric: 31000, label: "Apr" },
        { date: "2024-05-01", valueNumeric: 34500, label: "May" },
      ],
    },
    {
      key: "revenue",
      name: "Revenue",
      label: "Online store revenue (snapshot)",
      value: "250,000",
      valueNumeric: 250000,
      type: "currency",
      prefix: "AED ",
      unit: "AED",
      compact: true,
      category: "sales",
      featured: true,
      sortOrder: 1,
      visibility: "public",
      period: "year",
      trendPreference: "higher_is_better",
      previousNumeric: 189000,
      targetNumeric: 300000,
      metricGroupSlug: "sales-performance",
      projectId: null,
      experienceId: null,
      achievementId: achievements["grew-online-sales-storefront"]?.id ?? null,
    },
    {
      key: "conversion-story",
      name: "Conversion Rate",
      label: "Store conversion improvement",
      value: "4.8%",
      valueNumeric: 0.048,
      type: "percent",
      percentScale: "ratio",
      startValue: "2.1%",
      endValue: "4.8%",
      category: "sales",
      featured: true,
      sortOrder: 2,
      visibility: "public",
      period: "month",
      trendPreference: "higher_is_better",
      previousNumeric: 0.021,
      metricGroupSlug: "sales-performance",
      projectId: firstProject?.id ?? null,
      experienceId: null,
      achievementId: null,
    },
    {
      key: "products-managed",
      name: "Products Managed",
      value: "1,200",
      valueNumeric: 1200,
      type: "count",
      suffix: "+",
      category: "ecommerce",
      featured: false,
      sortOrder: 3,
      visibility: "public",
      metricGroupSlug: "sales-performance",
      projectId: null,
      experienceId: firstExperience?.id ?? null,
      achievementId: null,
    },
    {
      key: "incidents-resolved",
      name: "Incidents Resolved",
      value: "340",
      valueNumeric: 340,
      type: "count",
      category: "ops",
      featured: false,
      sortOrder: 0,
      visibility: "public",
      period: "year",
      trendPreference: "higher_is_better",
      metricGroupSlug: "technical-operations",
      projectId: null,
      experienceId: firstExperience?.id ?? null,
      achievementId: achievements["completed-major-systems-migration"]?.id ?? null,
    },
    {
      key: "processing-time",
      name: "Avg Processing Time",
      value: "12",
      valueNumeric: 12,
      type: "duration",
      unit: "hours",
      suffix: "h",
      category: "ops",
      featured: false,
      sortOrder: 1,
      visibility: "public",
      period: "month",
      trendPreference: "lower_is_better",
      previousNumeric: 18,
      metricGroupSlug: "technical-operations",
      projectId: null,
      experienceId: firstExperience?.id ?? null,
      achievementId: achievements["reduced-operational-processing-time"]?.id ?? null,
    },
    {
      key: "design-projects",
      name: "Design Projects",
      value: "47",
      valueNumeric: 47,
      type: "count",
      category: "design",
      featured: true,
      sortOrder: 0,
      visibility: "public",
      metricGroupSlug: "design-portfolio",
      projectId: firstProject?.id ?? null,
      experienceId: null,
      achievementId: achievements["launched-brand-identity-system"]?.id ?? null,
    },
    {
      key: "roas",
      name: "ROAS",
      value: "3.7",
      valueNumeric: 3.7,
      type: "ratio",
      suffix: "x",
      category: "sales",
      featured: false,
      sortOrder: 4,
      visibility: "public",
      metricGroupSlug: "sales-performance",
      projectId: null,
      experienceId: null,
      achievementId: achievements["grew-online-sales-storefront"]?.id ?? null,
    },
  ];

  function utcDate(isoDay) {
    const d = new Date(isoDay);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  for (const def of metricDefs) {
    const groupId = groups[def.metricGroupSlug]?.id ?? null;
    const existing = await prisma.metric.findFirst({
      where: {
        name: def.name,
        metricGroupId: groupId,
      },
    });

    const data = {
      name: def.name,
      label: def.label || null,
      value: def.value,
      valueNumeric: def.valueNumeric ?? null,
      unit: def.unit || null,
      type: def.type,
      prefix: def.prefix || null,
      suffix: def.suffix || null,
      startValue: def.startValue || null,
      endValue: def.endValue || null,
      category: def.category || null,
      featured: def.featured,
      sortOrder: def.sortOrder,
      visibility: def.visibility,
      metricGroupId: groupId,
      projectId: def.projectId,
      experienceId: def.experienceId,
      achievementId: def.achievementId,
      period: def.period ?? null,
      trendPreference: def.trendPreference || "neutral",
      previousNumeric: def.previousNumeric ?? null,
      targetNumeric: def.targetNumeric ?? null,
      baselineNumeric: def.baselineNumeric ?? null,
      decimals: def.decimals ?? null,
      compact: Boolean(def.compact),
      percentScale: def.percentScale || "auto",
      ratingMax: def.ratingMax ?? null,
    };

    let saved;
    if (existing) {
      saved = await prisma.metric.update({ where: { id: existing.id }, data });
    } else {
      saved = await prisma.metric.create({ data });
    }

    if (Array.isArray(def.series)) {
      for (let i = 0; i < def.series.length; i += 1) {
        const pt = def.series[i];
        const date = utcDate(pt.date);
        await prisma.metricDataPoint.upsert({
          where: {
            metricId_date: { metricId: saved.id, date },
          },
          update: {
            valueNumeric: pt.valueNumeric,
            label: pt.label || null,
            value: pt.value || null,
            sortOrder: i,
            metadata: pt.metadata || { source: "seed" },
          },
          create: {
            metricId: saved.id,
            date,
            valueNumeric: pt.valueNumeric,
            label: pt.label || null,
            value: pt.value || null,
            sortOrder: i,
            metadata: pt.metadata || { source: "seed" },
          },
        });
      }
    }
  }

  const certDefs = [
    {
      title: "IT Support Fundamentals",
      issuer: "Professional Development",
      issuedAt: new Date("2021-03-01"),
      sortOrder: 0,
      featured: true,
    },
    {
      title: "Digital Marketing Essentials",
      issuer: "Online Academy",
      issuedAt: new Date("2022-08-01"),
      sortOrder: 1,
      featured: false,
    },
  ];

  for (const def of certDefs) {
    const existing = await prisma.certification.findFirst({
      where: { title: def.title, issuer: def.issuer },
    });
    if (existing) {
      await prisma.certification.update({
        where: { id: existing.id },
        data: def,
      });
    } else {
      await prisma.certification.create({ data: def });
    }
  }

  const eduDefs = [
    {
      institution: "Damascus University",
      degree: "Bachelor",
      field: "Related studies",
      period: "—",
      description: "Academic foundation supporting IT and creative work.",
      sortOrder: 0,
    },
  ];

  for (const def of eduDefs) {
    const existing = await prisma.education.findFirst({
      where: { institution: def.institution, degree: def.degree },
    });
    if (existing) {
      await prisma.education.update({ where: { id: existing.id }, data: def });
    } else {
      await prisma.education.create({ data: def });
    }
  }

  const skillDefs = (siteConfig.tools || []).map((name, index) => ({
    name,
    category: ["Photoshop", "Illustrator", "Kelk", "Figma"].includes(name)
      ? "Design"
      : ["Php", "HTML", "CSS", "Javascript", "Bootstrap", "React"].includes(name)
        ? "Development"
        : "General",
    sortOrder: index,
    featured: index < 6,
  }));

  for (const def of skillDefs) {
    await prisma.skill.upsert({
      where: { name: def.name },
      update: {
        category: def.category,
        sortOrder: def.sortOrder,
        featured: def.featured,
      },
      create: def,
    });
  }

  const milestoneDefs = [
    {
      title: "Relocated to Dubai and expanded IT support practice",
      date: new Date("2019-01-01"),
      description: "Career move into UAE-based operations and client service.",
      type: "career",
      sortOrder: 0,
      featured: true,
    },
    {
      title: "Expanded into e-commerce operations",
      date: new Date("2021-06-01"),
      description: "Took on Amazon/Noon seller operations alongside design work.",
      type: "business",
      sortOrder: 1,
      featured: true,
    },
    {
      title: "AZURA Portfolio platform launched",
      date: new Date("2025-01-01"),
      description: "Self-hosted professional archive and portfolio CMS.",
      type: "project",
      sortOrder: 2,
      featured: false,
    },
  ];

  for (const def of milestoneDefs) {
    const existing = await prisma.milestone.findFirst({
      where: { title: def.title },
    });
    if (existing) {
      await prisma.milestone.update({ where: { id: existing.id }, data: def });
    } else {
      await prisma.milestone.create({ data: def });
    }
  }
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
