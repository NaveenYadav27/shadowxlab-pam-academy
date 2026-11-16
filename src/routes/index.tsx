import { createFileRoute } from "@tanstack/react-router";
import { PamAcademy, type SectionId } from "@/components/pam-academy";

interface IndexSearchParams {
  section?: SectionId;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): IndexSearchParams => {
    return {
      section: (search.section as SectionId) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "ShadowXLab PAM Academy | Enterprise Privileged Access Training" },
      {
        name: "description",
        content:
          "ShadowXLab PAM Academy is an enterprise privileged access management training and simulation platform featuring interactive account administration, Safe governance, CPM workflows, PSM session operations, audit trails, and structured administrator learning.",
      },
      { property: "og:title", content: "ShadowXLab PAM Academy | Enterprise Privileged Access Training" },
      {
        property: "og:description",
        content:
          "ShadowXLab PAM Academy is an enterprise privileged access management training and simulation platform featuring interactive account administration, Safe governance, CPM workflows, PSM session operations, audit trails, and structured administrator learning.",
      },
      { property: "og:url", content: "https://cyberark.shadowxlab.com/" },
      { property: "og:image", content: "https://cyberark.shadowxlab.com/og-image.png" },
    ],
  }),
  component: Index,
});

function Index() {
  const { section } = Route.useSearch();
  return <PamAcademy initialSection={section} />;
}
