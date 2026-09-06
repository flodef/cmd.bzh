import { SiteShell } from '../components/siteShell';
import { ReviewsCacheProvider } from '../contexts/reviewsCacheProvider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReviewsCacheProvider>
      <SiteShell>{children}</SiteShell>
    </ReviewsCacheProvider>
  );
}
