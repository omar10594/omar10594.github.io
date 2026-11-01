export interface ProjectDefinition {
  id: string;
  title: string;
  summary: string;
  externalUrl?: string;
  sourceUrl?: string;
}
export const projects = [
  { id: 'playbusiness', title: 'PlayBusiness', summary: 'Growing from developer to technology leadership by understanding the whole business.', externalUrl: 'https://playbusiness.mx/' },
  { id: 'sosimple', title: 'SoSimple', summary: 'AI and automation built around how people actually work.', externalUrl: 'https://sosimple.capital/' },
  { id: 'miss-luciana', title: 'Miss Luciana', summary: 'Teaching insight by Luciana. Product and engineering by Omar.', externalUrl: 'https://missluciana.com/' },
  { id: 'horarios', title: 'Horarios', summary: 'A schedule tool designed for the person working the shift.' },
  { id: 'roomies', title: 'Roomies', summary: 'A clear view of rent, built around a small everyday need.' },
] as const satisfies readonly ProjectDefinition[];
export type ProjectId = typeof projects[number]['id'];
export const projectRoute = (id: string): string => `/projects/${id}/`;
export const projectDocumentPath = (id: string): string => `/home/omar/projects/${id}/README.md`;
export function projectById(id: string): ProjectDefinition | undefined {
  return projects.find((project) => project.id === id);
}
export function projectForDocument(path: string): ProjectDefinition | undefined {
  return projects.find((project) => projectDocumentPath(project.id) === path);
}
