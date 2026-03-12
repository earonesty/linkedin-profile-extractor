import type {
  LinkedInExport,
  ExperienceItem,
  EducationItem,
  SkillsSection,
  ProjectItem,
  PublicationItem,
  CertificationItem,
} from "./types";

export type JsonResume = {
  basics: {
    name: string;
    label: string;
    image: string;
    url: string;
    summary: string;
    location: { region: string };
  };
  work: Array<{
    name: string;
    position: string;
    startDate: string;
    summary: string;
  }>;
  education: Array<{
    institution: string;
    area: string;
    studyType: string;
    startDate: string;
  }>;
  skills: Array<{ name: string }>;
  projects: Array<{
    name: string;
    description: string;
    url: string;
  }>;
  publications: Array<{
    name: string;
    publisher: string;
    releaseDate: string;
    summary: string;
    url: string;
  }>;
  certificates: Array<{
    name: string;
    issuer: string;
    date: string;
    url: string;
  }>;
};

function findSection(data: LinkedInExport, id: string) {
  return data.sections.find((s) => s.id === id);
}

export function toJsonResume(data: LinkedInExport): JsonResume {
  const aboutSection = findSection(data, "about");
  const aboutText =
    aboutSection && aboutSection.items.length > 0
      ? ((aboutSection.items[0] as { about_text: string | null }).about_text ?? "")
      : "";

  const experienceSection = findSection(data, "experience");
  const work = (experienceSection?.items ?? []).map((item) => {
    const exp = item as ExperienceItem;
    return {
      name: exp.company ?? "",
      position: exp.title ?? "",
      startDate: exp.date_range_raw ?? "",
      summary: exp.description ?? "",
    };
  });

  const educationSection = findSection(data, "education");
  const education = (educationSection?.items ?? []).map((item) => {
    const edu = item as EducationItem;
    return {
      institution: edu.school ?? "",
      area: edu.field_of_study ?? "",
      studyType: edu.degree ?? "",
      startDate: edu.date_range_raw ?? "",
    };
  });

  const skillsSection = findSection(data, "skills");
  const skillItems = skillsSection?.items ?? [];
  // items may be string[] (from extract orchestrator unwrapping) or [{ skills: string[] }]
  const skillNames: string[] = skillItems.every((i) => typeof i === "string")
    ? (skillItems as string[])
    : skillItems.length > 0 && (skillItems[0] as SkillsSection).skills
      ? (skillItems[0] as SkillsSection).skills
      : [];
  const skills = skillNames.map((name) => ({ name }));

  const projectsSection = findSection(data, "projects");
  const projects = (projectsSection?.items ?? []).map((item) => {
    const proj = item as ProjectItem;
    return {
      name: proj.name ?? "",
      description: proj.description ?? "",
      url: proj.url ?? "",
    };
  });

  const publicationsSection = findSection(data, "publications");
  const publications = (publicationsSection?.items ?? []).map((item) => {
    const pub = item as PublicationItem;
    return {
      name: pub.title ?? "",
      publisher: pub.publisher ?? "",
      releaseDate: pub.published_date ?? "",
      summary: pub.description ?? "",
      url: pub.url ?? "",
    };
  });

  const certificationsSection = findSection(data, "licenses-and-certifications");
  const certificates = (certificationsSection?.items ?? []).map((item) => {
    const cert = item as CertificationItem;
    return {
      name: cert.name ?? "",
      issuer: cert.issuer ?? "",
      date: cert.issue_date ?? "",
      url: cert.credential_url ?? "",
    };
  });

  return {
    basics: {
      name: data.top_card.full_name ?? "",
      label: data.top_card.headline ?? "",
      image: data.top_card.profile_image_url ?? "",
      url: data.source.profile_url,
      summary: aboutText,
      location: { region: data.top_card.location ?? "" },
    },
    work,
    education,
    skills,
    projects,
    publications,
    certificates,
  };
}
