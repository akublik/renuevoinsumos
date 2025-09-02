
export type HomePageContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroImageUrl: string;
  whyTitle: string;
  whyDescription: string;
  whyPoint1: string;
  whyPoint2: string;
  whyPoint3: string;
  whyImageUrl: string;
};

export type TeamMember = {
  name: string;
  role: string;
  imageUrl: string;
};

export type AboutPageContent = {
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImageUrl: string;
  teamTitle: string;
  team: TeamMember[];
};
