import type { WorkspaceDocument } from '../terminal/engine';
import readme from '../../data/workspace/README.md?raw';
import about from '../../data/workspace/about.md?raw';
import contact from '../../data/workspace/contact.md?raw';
import cv from '../../data/workspace/cv/README.md?raw';
import experience from '../../data/workspace/cv/experience.md?raw';
import education from '../../data/workspace/cv/education.md?raw';
import skills from '../../data/workspace/cv/skills.md?raw';
import projects from '../../data/workspace/projects/README.md?raw';

export const documents: WorkspaceDocument[] = [
  {
    path: '/home/omar/README.md',
    title: 'Welcome',
    content: readme,
    kind: 'document',
  },
  {
    path: '/home/omar/about.md',
    title: 'About',
    content: about,
    kind: 'document',
  },
  {
    path: '/home/omar/contact.md',
    title: 'Contact',
    content: contact,
    kind: 'contact',
  },
  {
    path: '/home/omar/cv/README.md',
    title: 'CV',
    content: cv,
    kind: 'document',
  },
  {
    path: '/home/omar/cv/experience.md',
    title: 'Experience',
    content: experience,
    kind: 'document',
  },
  {
    path: '/home/omar/cv/education.md',
    title: 'Education',
    content: education,
    kind: 'document',
  },
  {
    path: '/home/omar/cv/skills.md',
    title: 'Skills',
    content: skills,
    kind: 'document',
  },
  {
    path: '/home/omar/projects/README.md',
    title: 'Projects',
    content: projects,
    kind: 'projects',
  },
];

export const encodedEmail = 'Z3VpbGxlcm1vQGxvcGV6bG9wZXouY29tLm14';

export const CONTACT_LINKS = [
  { title: 'GitHub', url: 'https://github.com/omar10594' },
  { title: 'LinkedIn', url: 'https://www.linkedin.com/in/omar10594/' },
] as const;
