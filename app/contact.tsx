'use client';

import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { Button, Input } from 'antd';
import { info } from './page';
import Link from 'next/link';

const { TextArea } = Input;

const t = {
  fr: {
    ContactUs: 'Contactez-nous',
    GetInTouch: 'Restons en contact',
    Name: 'Nom',
    Email: 'Email',
    Phone: 'Téléphone',
    Message: 'Message',
    Address: 'Adresse',
    SendMessage: 'Envoyer le message',
    ContactInformation: 'Informations de contact',
    BusinessHours: "Horaires d'ouverture",
    BusinessHoursDescription: '7 jours sur 7, de 9h à 18h',
  },
  en: {
    ContactUs: 'Contact Us',
    GetInTouch: 'Get in Touch',
    Name: 'Name',
    Email: 'Email',
    Phone: 'Phone',
    Message: 'Message',
    Address: 'Address',
    SendMessage: 'Send Message',
    ContactInformation: 'Contact Information',
    BusinessHours: 'Business Hours',
    BusinessHoursDescription: '7 days a week, from 9h to 18h',
  },
};

export default function Contact() {
  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">{t['fr'].ContactUs}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t['fr'].GetInTouch}</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t['fr'].Name}
                  </label>
                  <Input type="text" id="name" name="name" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t['fr'].Email}
                  </label>
                  <Input type="email" id="email" name="email" required />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t['fr'].Phone}
                  </label>
                  <Input type="tel" id="phone" name="phone" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {t['fr'].Message}
                  </label>
                  <TextArea id="message" name="message" rows={4} required showCount maxLength={100} />
                </div>
                <Button htmlType="submit" className="w-full">
                  {t['fr'].SendMessage}
                </Button>
              </form>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t['fr'].ContactInformation}</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <IconMapPin className="mr-2 mt-1" size={18} />
                  <div>
                    <p className="font-semibold">{t['fr'].Address}:</p>
                    {info.address.split(',').map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <IconPhone className="mr-2" size={18} />
                  <div>
                    <p className="font-semibold">{t['fr'].Phone}:</p>
                    <p>
                      <Link href={`tel:${info.phone.replaceAll(' ', '')}`}>{info.phone}</Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <IconMail className="mr-2" size={18} />
                  <div>
                    <p className="font-semibold">{t['fr'].Email}:</p>
                    <p>
                      <Link href={`mailto:${info.email}`}>{info.email}</Link>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-2">{t['fr'].BusinessHours}</h3>
                <p>{t['fr'].BusinessHoursDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
