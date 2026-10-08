'use client';

import { IconMail, IconMapPin, IconPhone, IconPlus, IconSend, IconUser, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../components/ui/button';
import { Field, FieldList, Form, useForm } from '../components/ui/form';
import { Input, TextArea } from '../components/ui/input';
import { Reveal } from '../components/ui/reveal';
import { useToast } from '../components/ui/toast';
import { useT } from '../contexts/languageProvider';
import { businessHours, companyInfo, emailRegex, phoneRegex } from '../utils/constants';
import { formatBusinessHours, getBusinessStatus, getPhoneNumber } from '../utils/functions';

type FieldType = {
  Nom?: string;
  Contacts?: { contact: string }[];
  Message?: string;
};

enum FieldError {
  Min = 'min',
  Max = 'max',
  Required = 'required',
}

export default function Contact() {
  const t = useT();
  const toast = useToast();

  const [form] = useForm<Record<string, unknown>>({ Nom: '', Contacts: [{ contact: '' }], Message: '' });

  const [hasContactError, setHasContactError] = useState(false);
  const [sending, setSending] = useState(false);
  const [businessStatus, setBusinessStatus] = useState(getBusinessStatus());

  // Update business status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setBusinessStatus(getBusinessStatus());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const contacts = () => (form.getFieldValue('Contacts') as { contact?: string }[] | undefined) ?? [];

  const onFinish = async (values: Record<string, unknown>) => {
    setSending(true);
    try {
      const vals = values as FieldType;
      const transformedContacts = vals.Contacts?.map(
        ({ contact }, index) => `\n    ${index + 1}. ${t(getContactType(index))}: ${contact}`,
      );

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vals, Contacts: transformedContacts }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) throw new Error('Failed to send message');
      form.resetFields();
      toast.success(t('MessageSent'));
    } catch {
      toast.error(t('MessageError'));
    } finally {
      setSending(false);
    }
  };

  const onFinishFailed = (errorInfo: unknown) => {
    console.error('Failed:', errorInfo);
    toast.error(t('MessageError'));
  };

  const getErrorMessage = (fieldName: string, fieldError?: FieldError, info?: string | number) => {
    switch (fieldError) {
      case FieldError.Min:
        return t('FieldMin', { field: t(fieldName), min: String(info) });
      case FieldError.Max:
        return t('FieldMax', { field: t(fieldName), max: String(info) });
      case FieldError.Required:
        return t('FieldRequired', { field: t(fieldName) });
      default:
        return t(fieldName + 'Error');
    }
  };

  const isEmailContact = (index: number) => /[^0-9+-.\s]/.test(contacts().at(index)?.contact ?? '');
  const getContactType = (index: number) => (isEmailContact(index) ? 'Email' : 'Phone');

  return (
    <section id="contact" className="scroll-mt-24 w-full max-w-7xl mx-auto">
      <Reveal className="px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
          <div className="glass-soft glass-hover rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-6 text-bark dark:text-cream">{t('GetInTouch')}</h2>
            <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed} disabled={sending}>
              <Field
                label={t('Name')}
                name="Nom"
                hasFeedback
                rules={[
                  { required: true, message: getErrorMessage('Name', FieldError.Required) },
                  { min: 5, message: getErrorMessage('Name', FieldError.Min, 5) },
                  { max: 50, message: getErrorMessage('Name', FieldError.Max, 50) },
                  { pattern: /^[a-zA-Z\s]+$/, message: getErrorMessage('Name') },
                ]}
              >
                <Input
                  prefix={<IconUser aria-label="User icon" />}
                  placeholder={t('Your') + ' ' + t('Name')}
                  aria-label={t('Name')}
                  aria-required="true"
                />
              </Field>
              <FieldList name="Contacts">
                {(contactFields, { add, remove }) => (
                  <div className="mb-5">
                    <span className="mb-1.5 block text-sm font-medium text-bark dark:text-cream">Contact(s)</span>
                    <div className="flex flex-col gap-y-3">
                      {contactFields.map((contactField, index) => (
                        <div key={contactField.key} className="flex items-start gap-2">
                          <Field
                            noStyle
                            name={[contactField.name, 'contact']}
                            hasFeedback
                            rules={[
                              { required: true, message: getErrorMessage('Contact', FieldError.Required) },
                              {
                                min: 10,
                                message: getErrorMessage(getContactType(index), FieldError.Min, 10),
                              },
                              {
                                max: 50,
                                message: getErrorMessage(getContactType(index), FieldError.Max, 50),
                              },
                              {
                                pattern: isEmailContact(index) ? emailRegex : phoneRegex,
                                message: getErrorMessage(getContactType(index)),
                              },
                              getFieldValue => ({
                                validator(_, value) {
                                  const list = (getFieldValue('Contacts') as { contact: string }[]) ?? [];
                                  if (
                                    !value ||
                                    list.reduce((c, contact) => (contact?.contact === value ? c + 1 : c), 0) === 1
                                  ) {
                                    setHasContactError(false);
                                    return Promise.resolve();
                                  }
                                  setHasContactError(true);
                                  return Promise.reject(
                                    new Error(t('DuplicateContact', { field: t(getContactType(index)) })),
                                  );
                                },
                              }),
                            ]}
                          >
                            <Input
                              className="grow"
                              prefix={
                                isEmailContact(index) ? (
                                  <IconMail aria-label="Email icon" />
                                ) : (
                                  <IconPhone aria-label="Phone icon" />
                                )
                              }
                              placeholder={t('Your') + ' ' + t('Email') + ' / ' + t('Phone')}
                              aria-label={`${t('Contact')} ${index + 1}`}
                              aria-required="true"
                            />
                          </Field>
                          <button
                            type="button"
                            className={twMerge(
                              'mt-3 text-bark/60 dark:text-cream/60 hover:text-red-500 transition-colors',
                              contacts().at(0)?.contact ? 'cursor-pointer' : 'hidden',
                            )}
                            onClick={() => {
                              if (contactFields.length === 1)
                                form.resetFields(['Contacts']); // Just clear the field
                              else remove(contactField.name); // Remove the selected field
                            }}
                            aria-label={t('Remove contact')}
                          >
                            <IconX />
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="dashed"
                        icon={<IconPlus aria-label="Add icon" />}
                        iconPosition="start"
                        disabled={
                          contacts().some(contact => !contact?.contact) ||
                          form.getFieldError('Contacts').length > 0 ||
                          contacts().length !== contactFields.length ||
                          contactFields.length >= 5 ||
                          hasContactError ||
                          sending
                        }
                        onClick={() => add()}
                        aria-label={t('AddContact')}
                      >
                        {t('AddContact')}
                      </Button>
                    </div>
                  </div>
                )}
              </FieldList>
              <Field
                label={t('Message')}
                name="Message"
                hasFeedback
                rules={[
                  { required: true, message: getErrorMessage('Message', FieldError.Required) },
                  { min: 20, message: getErrorMessage('Message', FieldError.Min, 20) },
                ]}
              >
                <TextArea
                  id="message"
                  name="message"
                  showCount
                  minRows={3}
                  maxLength={500}
                  placeholder={t('Your') + ' ' + t('Message')}
                  aria-label={t('Message')}
                  aria-required="true"
                />
              </Field>
              <div className="flex justify-end pt-2">
                <Button
                  icon={<IconSend aria-label="Send icon" />}
                  iconPosition="start"
                  loading={sending}
                  variant="primary"
                  type="submit"
                  aria-label={t('SendMessage')}
                >
                  {t('SendMessage')}
                </Button>
              </div>
            </Form>
          </div>
          <div>
            <Reveal delay={100} className="space-y-4 mb-8 hidden md:block glass-soft glass-hover rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4 text-bark dark:text-cream">{t('ContactInformation')}</h3>
              <div className="space-y-4 justify-self-center">
                <div className="flex items-start text-bark/80 dark:text-cream/80">
                  <IconMapPin className="mr-2 mt-1 flex-none" size={18} />
                  <div>
                    <p className="font-semibold text-bark dark:text-cream">{t('Address')}:</p>
                    {companyInfo.address.split(',').map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </div>
                </div>
                <div className="flex items-start text-bark/80 dark:text-cream/80">
                  <IconPhone className="mr-2 flex-none" size={18} />
                  <div>
                    <p className="font-semibold text-bark dark:text-cream">{t('Phone')}:</p>
                    <p>
                      <Link href={`tel:${getPhoneNumber(companyInfo.phone)}`}>{companyInfo.phone}</Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-start text-bark/80 dark:text-cream/80">
                  <IconMail className="mr-2 flex-none" size={18} />
                  <div>
                    <p className="font-semibold text-bark dark:text-cream">{t('Email')}:</p>
                    <p>
                      <Link href={`mailto:${companyInfo.email}`}>{companyInfo.email}</Link>
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={200} className="glass-soft glass-hover rounded-3xl p-8 mt-8 md:mt-0">
              <h3 className="text-2xl font-semibold mb-2 text-bark dark:text-cream">{t('BusinessHours')}</h3>
              <div className="justify-self-center space-y-2 text-bark/80 dark:text-cream/80">
                <p>
                  <span className="font-semibold text-bark dark:text-cream">{t('Status')}: </span>
                  <span
                    className={businessStatus.isOpen ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}
                  >
                    {t(businessStatus.message)}
                    {businessStatus.minutesUntilChange && (
                      <span>
                        {' '}
                        {t('In')} {businessStatus.minutesUntilChange} {t('Minutes')}
                      </span>
                    )}
                  </span>
                </p>
                <p>
                  {t('Schedule')}: {t(formatBusinessHours())}
                </p>
                <p>
                  {t('ReplyTime')}: {t('Within')} {businessHours.replyTimeHours} {t('Hours')}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
