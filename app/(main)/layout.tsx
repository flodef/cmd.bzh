import { SiteShell } from '../components/siteShell';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
