import { t } from '../i18n';
import { companyInfo } from '../utils/constants';

export default function GDPR() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">{t('GDPRTitle')}</h1>

        <div className="prose max-w-4xl mx-auto">
          <p className="mb-6">{t('GDPRIntroduction')}</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('GDPRDataCollection')}</h2>
          <p>{t('GDPRDataCollectionText')}</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('GDPRDataUsage')}</h2>
          <p>{t('GDPRDataUsageText')}</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('GDPRUserRights')}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('GDPRRightAccess')}</li>
            <li>{t('GDPRRightRectification')}</li>
            <li>{t('GDPRRightErasure')}</li>
            <li>{t('GDPRRightRestriction')}</li>
            <li>{t('GDPRRightDataPortability')}</li>
            <li>{t('GDPRRightObject')}</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">{t('GDPRContact')}</h2>
          <p>{t('GDPRContactText', { email: companyInfo.email })}</p>
        </div>
      </div>
    </section>
  );
}
