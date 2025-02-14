import { useMemo } from 'react';
import { useWindowParam } from '../hooks/useWindowParam';
import { t } from '../i18n';
import { companyInfo, creatorInfo } from '../utils/constants';

export default function GDPR() {
  const { width } = useWindowParam();
  const isMobile = useMemo(() => width > 0 && width < 640, [width]);

  return (
    <div className="container mx-auto px-4 py-8">
      {!isMobile && <h1 className="text-3xl font-bold text-center mb-8">{t('GDPR')}</h1>}

      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Preamble */}
        <section className="space-y-4">
          <p>{t('GDPRIntroduction')}</p>
          <p>{t('GDPRDataCollectionText')}</p>
          <p>{t('GDPRContactText', { email: companyInfo.email })}</p>
        </section>

        {/* Section 1: Legal Publisher */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('GDPRLegalPublisher')}</h2>
          {t('GDPRPublisherContent', {
            shortName: companyInfo.shortName,
            companyType: companyInfo.companyType,
            RCSCity: companyInfo.RCSCity,
            SIREN: companyInfo.SIREN,
            address: companyInfo.address,
            TVA: companyInfo.TVA,
            founder: companyInfo.founder,
            phone: companyInfo.phone,
          })
            .split('/n')
            .map((line, i) => (
              <p key={`pub-${i}`} className="mb-2">
                {line}
              </p>
            ))}
        </section>
        {/* Section 2: Hosting */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('GDPRHosting')}</h2>
          {t('GDPRHostingContent')
            .split('/n')
            .map((line, i) => (
              <p key={`host-${i}`} className="mb-2">
                {line}
              </p>
            ))}
        </section>
        {/* Section 3: Terms */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('GDPRTerms')}</h2>
          {t('GDPRTermsContent', {
            url: companyInfo.url,
            shortName: companyInfo.shortName,
          })
            .split('/n')
            .map((line, i) => (
              <p key={`terms-${i}`} className="mb-2">
                {line}
              </p>
            ))}
        </section>
        {/* Section 4: Liability */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('GDPRLiability')}</h2>
          {t('GDPRLiabilityContent', {
            shortName: companyInfo.shortName,
          })
            .split('/n')
            .map((line, i) => (
              <p key={`liab-${i}`} className="mb-2">
                {line}
              </p>
            ))}
        </section>
        {/* Section 5: Disputes */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('GDPRDisputes')}</h2>
          {t('GDPRDisputesContent', {
            shortName: companyInfo.shortName,
          })
            .split('/n')
            .map((line, i) => (
              <p key={`disp-${i}`} className="mb-2">
                {line}
              </p>
            ))}
        </section>
        {/* Section 6: Data Rights */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('GDPRDataRights')}</h2>
          {t('GDPRDataRightsContent', {
            shortName: companyInfo.shortName,
            email: companyInfo.email,
            address: companyInfo.address,
          })
            .split('/n')
            .map((line, i) => (
              <p key={`rights-${i}`} className="mb-2">
                {line}
              </p>
            ))}
        </section>
        {/* Section 7: Data Collection */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('GDPRDataCollection')}</h2>
          {t('GDPRDataCollectionContent', {
            shortName: companyInfo.shortName,
          })
            .split('/n')
            .map((line, i) => (
              <p key={`collect-${i}`} className="mb-2">
                {line}
              </p>
            ))}
        </section>
        {/* Section 8: MIT License */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('GDPRMITLicense')}</h2>
          {t('GDPRMITContent', {
            shortName: companyInfo.shortName,
            currentYear: new Date().getFullYear().toString(),
          })
            .split('/n')
            .map((line, i) => (
              <p key={`mit-${i}`} className="mb-2">
                {line}
              </p>
            ))}
        </section>
        {/* Section 9: No Tracking */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('GDPRNoTracking')}</h2>
          {t('GDPRNoTrackingContent')
            .split('/n')
            .map((line, i) => (
              <p key={`track-${i}`} className="mb-2">
                {line}
              </p>
            ))}
        </section>
        {/* Section 10: Technical Provider */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('GDPRTechnicalProvider')}</h2>
          {t('GDPRTechnicalContent', {
            creatorName: creatorInfo.name,
            creatorStatus: creatorInfo.status,
            creatorSIREN: creatorInfo.SIREN,
          })
            .split('/n')
            .map((line, i) => (
              <p key={`tech-${i}`} className="mb-2">
                {line}
              </p>
            ))}
        </section>
      </div>
    </div>
  );
}
