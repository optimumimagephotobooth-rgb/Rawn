'use client'

import { Card } from '@/components/ui/Card'
import { useI18n } from '@/lib/i18n/context'

export default function PrivacyPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-950/80 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 mb-6">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                {t('privacy.page.tagline')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight">
              {t('privacy.page.title')}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl mx-auto">
              {t('privacy.page.subtitle')}
            </p>
            <p className="text-sm text-slate-400 mt-4">
              {t('privacy.page.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 leading-relaxed">
                {t('privacy.page.intro')}
              </p>
            </Card>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('privacy.page.infoWeCollect.title')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-3">{t('privacy.page.infoWeCollect.personalInfo.title')}</h3>
                  <p className="text-slate-300 mb-2">{t('privacy.page.infoWeCollect.personalInfo.description')}</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>{t('privacy.page.infoWeCollect.personalInfo.item1')}</li>
                    <li>{t('privacy.page.infoWeCollect.personalInfo.item2')}</li>
                    <li>{t('privacy.page.infoWeCollect.personalInfo.item3')}</li>
                    <li>{t('privacy.page.infoWeCollect.personalInfo.item4')}</li>
                    <li>{t('privacy.page.infoWeCollect.personalInfo.item5')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-3">{t('privacy.page.infoWeCollect.usageInfo.title')}</h3>
                  <p className="text-slate-300 mb-2">{t('privacy.page.infoWeCollect.usageInfo.description')}</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>{t('privacy.page.infoWeCollect.usageInfo.item1')}</li>
                    <li>{t('privacy.page.infoWeCollect.usageInfo.item2')}</li>
                    <li>{t('privacy.page.infoWeCollect.usageInfo.item3')}</li>
                    <li>{t('privacy.page.infoWeCollect.usageInfo.item4')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-3">{t('privacy.page.infoWeCollect.cookies.title')}</h3>
                  <p className="text-slate-300">
                    {t('privacy.page.infoWeCollect.cookies.description')}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('privacy.page.howWeUse.title')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 mb-4">{t('privacy.page.howWeUse.description')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>{t('privacy.page.howWeUse.item1')}</li>
                <li>{t('privacy.page.howWeUse.item2')}</li>
                <li>{t('privacy.page.howWeUse.item3')}</li>
                <li>{t('privacy.page.howWeUse.item4')}</li>
                <li>{t('privacy.page.howWeUse.item5')}</li>
                <li>{t('privacy.page.howWeUse.item6')}</li>
                <li>{t('privacy.page.howWeUse.item7')}</li>
              </ul>
            </Card>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('privacy.page.sharing.title')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 mb-4">{t('privacy.page.sharing.description')}</p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-2">{t('privacy.page.sharing.serviceProviders.title')}</h3>
                  <p className="text-slate-300">{t('privacy.page.sharing.serviceProviders.description')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-2">{t('privacy.page.sharing.legal.title')}</h3>
                  <p className="text-slate-300">{t('privacy.page.sharing.legal.description')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-2">{t('privacy.page.sharing.consent.title')}</h3>
                  <p className="text-slate-300">{t('privacy.page.sharing.consent.description')}</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('privacy.page.security.title')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 leading-relaxed">
                {t('privacy.page.security.description')}
              </p>
            </Card>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('privacy.page.rights.title')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 mb-4">{t('privacy.page.rights.description')}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>{t('privacy.page.rights.item1')}</li>
                <li>{t('privacy.page.rights.item2')}</li>
                <li>{t('privacy.page.rights.item3')}</li>
                <li>{t('privacy.page.rights.item4')}</li>
                <li>{t('privacy.page.rights.item5')}</li>
                <li>{t('privacy.page.rights.item6')}</li>
              </ul>
              <p className="text-slate-300 mt-4">
                {t('privacy.page.rights.contact')}
              </p>
            </Card>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('privacy.page.cookies.title')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 mb-4">{t('privacy.page.cookies.description')}</p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-2">{t('privacy.page.cookies.essential.title')}</h3>
                  <p className="text-slate-300">{t('privacy.page.cookies.essential.description')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-2">{t('privacy.page.cookies.analytics.title')}</h3>
                  <p className="text-slate-300">{t('privacy.page.cookies.analytics.description')}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-2">{t('privacy.page.cookies.preferences.title')}</h3>
                  <p className="text-slate-300">{t('privacy.page.cookies.preferences.description')}</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('privacy.page.thirdParty.title')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 leading-relaxed">
                {t('privacy.page.thirdParty.description')}
              </p>
            </Card>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('privacy.page.children.title')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 leading-relaxed">
                {t('privacy.page.children.description')}
              </p>
            </Card>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('privacy.page.changes.title')}</h2>
            <Card className="bg-slate-900/80 border border-white/10">
              <p className="text-slate-300 leading-relaxed">
                {t('privacy.page.changes.description')}
              </p>
            </Card>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-50 mb-6">{t('privacy.page.contact.title')}</h2>
            <Card className="bg-gradient-to-r from-amber-500/25 via-rose-500/15 to-indigo-500/20 border border-amber-400/40">
              <p className="text-slate-300 mb-4">
                {t('privacy.page.contact.description')}
              </p>
              <div className="space-y-2 text-slate-300">
                <p>
                  <strong className="text-amber-200/90">{t('privacy.page.contact.email')}:</strong>{' '}
                  <a href="mailto:privacy@rawnministry.org" className="text-amber-300 hover:text-amber-200 transition-colors">
                    privacy@rawnministry.org
                  </a>
                </p>
                <p>
                  <strong className="text-amber-200/90">{t('privacy.page.contact.mail')}:</strong>{' '}
                  {t('privacy.page.contact.address')}
                </p>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
