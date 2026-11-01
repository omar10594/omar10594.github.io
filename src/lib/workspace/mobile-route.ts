import { documents } from './content';
import { projectForDocument, projectDocumentPath } from '../../features/projects/registry';

export type MobileRouteKind = 'home' | 'projects' | 'project' | 'document' | 'not-found';

export interface MobileRoute {
  kind: MobileRouteKind;
  /** Normalized virtual path, or the authored value for an unknown route. */
  path: string | null;
  title: string;
  /** Stable identity used by navigation and scroll restoration. */
  key: string;
  displayPath: string;
}

export const HOME_PATH = '/home/omar/README.md';
export const CV_PATH = '/home/omar/cv/README.md';
export const PROJECTS_PATH = '/home/omar/projects/README.md';

function homeRoute(): MobileRoute {
  return { kind: 'home', path: null, title: 'Home', key: '', displayPath: '~/' };
}

function projectsRoute(): MobileRoute {
  return {
    kind: 'projects',
    path: PROJECTS_PATH,
    title: 'Projects',
    key: PROJECTS_PATH,
    displayPath: '~/projects',
  };
}

function documentRoute(path: string): MobileRoute {
  const document = documents.find((item) => item.path === path);
  if (!document) return notFoundRoute(path);
  return {
    kind: 'document',
    path,
    title: document.title,
    key: path,
    displayPath: displayPathFor(path),
  };
}

function projectViewRoute(project: { id: string; title: string }): MobileRoute {
  const path = projectDocumentPath(project.id);
  return {
    kind: 'project',
    path,
    title: project.title,
    key: path,
    displayPath: `~/projects/${project.id}`,
  };
}

function notFoundRoute(path: string | null): MobileRoute {
  return {
    kind: 'not-found',
    path,
    title: 'Not found',
    key: `not-found:${path ?? ''}`,
    displayPath: displayPathForUnknown(path),
  };
}

function displayPathFor(path: string): string {
  if (path === CV_PATH) return '~/cv';
  if (path === PROJECTS_PATH) return '~/projects';
  return path.replace(/^\/home\/omar\/?/, '~/');
}

function displayPathForUnknown(path: string | null): string {
  const clean = (path ?? '').trim().replace(/[\u0000-\u001f]/g, '').slice(0, 80);
  if (!clean) return '~/unknown';
  if (clean === '/') return '~/';
  if (clean.startsWith('/')) return clean.replace(/^\/home\/omar(?:\/|$)/, '~/');
  return `~/${clean}`;
}

/** Collapse a virtual path without ever throwing on malformed input. */
export function normalizeVirtualPath(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith('/')) return null;
  const segments: string[] = [];
  for (const rawSegment of trimmed.split('/')) {
    if (!rawSegment || rawSegment === '.') continue;
    if (rawSegment === '..') {
      segments.pop();
      continue;
    }
    if (/[\u0000-\u001f\\]/.test(rawSegment)) return null;
    segments.push(rawSegment);
  }
  return `/${segments.join('/')}`;
}

export function routeForPath(rawPath: string | null): MobileRoute {
  if (rawPath === null) return homeRoute();
  const path = normalizeVirtualPath(rawPath);
  if (path === null) return notFoundRoute(rawPath);

  if (path === '/' || path === HOME_PATH || path === '/home/omar') return homeRoute();
  if (path === CV_PATH || path === '/home/omar/cv') return documentRoute(CV_PATH);
  if (path === PROJECTS_PATH || path === '/home/omar/projects') return projectsRoute();

  const project = projectForDocument(path);
  if (project) return projectViewRoute(project);

  const document = documents.find((item) => item.path === path);
  if (document) {
    if (document.kind === 'projects') return projectsRoute();
    return documentRoute(path);
  }

  return notFoundRoute(path);
}

/** Parse the shared `#file=` links used by the desktop workspace. */
export function routeFromHash(hash: string): MobileRoute {
  const value = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!value) return homeRoute();

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(value);
  } catch {
    return notFoundRoute(null);
  }

  if (!params.has('file')) return notFoundRoute(null);
  return routeForPath(params.get('file') ?? '');
}

/** Hierarchical Back target that keeps a fresh deep link inside the app. */
export function backTarget(route: MobileRoute): MobileRoute | null {
  switch (route.kind) {
    case 'home':
      return null;
    case 'project':
      return projectsRoute();
    case 'projects':
    case 'not-found':
      return homeRoute();
    case 'document':
      if (route.path === CV_PATH) return homeRoute();
      if (route.path?.startsWith('/home/omar/cv/')) return routeForPath(CV_PATH);
      return homeRoute();
  }
  return homeRoute();
}

/** Hash fragment for a route. Home is the root path with no hash. */
export function hashForRoute(route: MobileRoute): string | null {
  if (route.kind === 'home') return '';
  if (route.path === null) return null;
  return `#file=${encodeURIComponent(route.path)}`;
}

export function hrefForPath(path: string): string {
  return `#file=${encodeURIComponent(path)}`;
}
