'use client';

import { IconMail, IconMapPin, IconPhone, IconUser } from '@tabler/icons-react';
import { Button, Form, FormProps, Input } from 'antd';
import Link from 'next/link';
import { companyInfo } from '../constants';

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
    BusinessHoursDescription: 'Tous les jours, de 9h à 18h',
    NameError: 'Veuillez entrer votre nom !',
    EmailError: 'Veuillez entrer votre email !',
    MessageError: 'Veuillez entrer votre message !',
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
    BusinessHoursDescription: 'Everyday, from 9 AM to 6 PM',
    NameError: 'Please input your name!',
    EmailError: 'Please input your email!',
    MessageError: 'Please input your message!',
  },
};

type FieldType = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = values => {
  console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
  console.log('Failed:', errorInfo);
};

// const textClassName = 'text-gray-900 dark:text-gray-400 text-lg block font-medium mb-1';

export default function Contact() {
  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">{t['fr'].ContactUs}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t['fr'].GetInTouch}</h2>
              <Form
                name="basic"
                layout={'vertical'}
                size="large"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={{}}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item<FieldType>
                  label={t['fr'].Name}
                  name="name"
                  rules={[{ required: true, message: t['fr'].NameError }]}
                >
                  <Input size="large" prefix={<IconUser />} />
                </Form.Item>
                <Form.Item<FieldType>
                  label={t['fr'].Email}
                  name="email"
                  rules={[{ required: true, message: t['fr'].EmailError }]}
                >
                  <Input size="large" prefix={<IconMail />} />
                </Form.Item>
                <Form.Item<FieldType> label={t['fr'].Phone} name="phone">
                  <Input size="large" prefix={<IconPhone />} />
                </Form.Item>
                <Form.Item<FieldType>
                  label={t['fr'].Message}
                  name="message"
                  rules={[{ required: true, message: t['fr'].MessageError }]}
                >
                  <TextArea id="message" name="message" showCount autoSize={{ minRows: 2 }} maxLength={500} />
                </Form.Item>
                <Form.Item className="flex justify-end pt-4">
                  <Button icon={<IconMail />}>{t['fr'].SendMessage}</Button>
                </Form.Item>{' '}
              </Form>
              {/* <form className="space-y-4">
                <div>
                  <label htmlFor="name" className={textClassName}>
                    {t['fr'].Name}
                  </label>
                  <Input type="text" id="name" name="name" required />
                </div>
                <div>
                  <label htmlFor="email" className={textClassName}>
                    {t['fr'].Email}
                  </label>
                  <Input type="email" id="email" name="email" required />
                </div>
                <div>
                  <label htmlFor="phone" className={textClassName}>
                    {t['fr'].Phone}
                  </label>
                  <Input type="tel" id="phone" name="phone" />
                </div>
                <div>
                  <label htmlFor="message" className={textClassName}>
                    {t['fr'].Message}
                  </label>
                  <TextArea id="message" name="message" required showCount autoSize={{ minRows: 2 }} maxLength={500} />
                </div>
                <div className="flex justify-end pt-4">
                  <Button size="large" htmlType="submit" icon={<IconMail />}>
                    {t['fr'].SendMessage}
                  </Button>
                </div>
              </form> */}
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t['fr'].ContactInformation}</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <IconMapPin className="mr-2 mt-1" size={18} />
                  <div>
                    <p className="font-semibold">{t['fr'].Address}:</p>
                    {companyInfo.address.split(',').map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <IconPhone className="mr-2" size={18} />
                  <div>
                    <p className="font-semibold">{t['fr'].Phone}:</p>
                    <p>
                      <Link href={`tel:${companyInfo.phone.replaceAll(' ', '')}`}>{companyInfo.phone}</Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <IconMail className="mr-2" size={18} />
                  <div>
                    <p className="font-semibold">{t['fr'].Email}:</p>
                    <p>
                      <Link href={`mailto:${companyInfo.email}`}>{companyInfo.email}</Link>
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
