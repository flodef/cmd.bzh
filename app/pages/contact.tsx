'use client';

import { IconMail, IconMapPin, IconPhone, IconPlus, IconSend, IconUser, IconX } from '@tabler/icons-react';
import { Button, Form, FormProps, Input, InputRef, message, Space } from 'antd';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { t } from '../i18n';
import { companyInfo } from '../utils/constants';
import { getPhoneNumber } from '../utils/functions';
import { Page, useMenuContext } from '../contexts/menuProvider';

const { TextArea } = Input;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+?\d{1,3}?[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

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
  const { activeTab } = useMenuContext();

  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isMessageValid, setIsMessageValid] = useState<boolean>(true);
  const [hasContactError, setHasContactError] = useState(false);
  const [sending, setSending] = useState(false);

  const nameRef = useRef<InputRef>(null);
  useEffect(() => {
    if (activeTab !== Page.Contact) return;

    nameRef.current?.focus(); // Set focus on the name input when the page is displayed
  }, [activeTab]);

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setIsFormValid(true))
      .catch(() => setIsFormValid(false));
    form
      .validateFields(['Message'], { validateOnly: true })
      .then(() => setIsMessageValid(true))
      .catch(() => setIsMessageValid(false));
  }, [form, values]);

  const onFinish: FormProps<FieldType>['onFinish'] = async values => {
    setSending(true);
    try {
      const transformedContacts = values.Contacts?.map(
        ({ contact }, index) => `\n    ${index + 1}. ${t(getContactType(index))}: ${contact}`,
      );

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          Contacts: transformedContacts,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      form.resetFields();
      messageApi.success(t('MessageSent'));
    } catch {
      messageApi.error(t('MessageError'));
    } finally {
      setSending(false);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
    console.error('Failed:', errorInfo);
    messageApi.error(t('MessageError'));
  };

  const getErrorMessage = (fieldName: string, fieldError?: FieldError, info?: string | number) => {
    switch (fieldError) {
      case FieldError.Min:
        return t('FieldMin').replace('{0}', t(fieldName)).replace('{1}', String(info));
      case FieldError.Max:
        return t('FieldMax').replace('{0}', t(fieldName)).replace('{1}', String(info));
      case FieldError.Required:
        return t('FieldRequired').replace('{0}', t(fieldName));
      default:
        return t(fieldName + 'Error');
    }
  };

  const isEmailContact = (index: number) => /[^0-9+-.\s]/.test(form.getFieldValue('Contacts').at(index)?.contact);
  const getContactType = (index: number) => (isEmailContact(index) ? 'Email' : 'Phone');

  return (
    <>
      {contextHolder}
      <section className="py-12">
        <div className="md:mx-4 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t('GetInTouch')}</h2>
              <Form
                name="contactInfo"
                form={form}
                layout={'horizontal'}
                size="large"
                disabled={sending}
                scrollToFirstError={{ behavior: 'smooth', block: 'start' }}
                style={{ maxWidth: 600 }}
                labelCol={{ xs: 6, lg: 5 }}
                wrapperCol={{ xs: 18, sm: 12, md: 18, lg: 14, xl: 12 }}
                initialValues={{ Nom: '', Contacts: [{ contact: '' }], Message: '' }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                requiredMark={false}
                validateTrigger="onChange"
                autoComplete="on"
              >
                <Form.Item<FieldType>
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
                  <Input ref={nameRef} prefix={<IconUser />} placeholder={t('Your') + ' ' + t('Name')} />
                </Form.Item>
                <Form.Item label="Contact(s)">
                  <Form.List name="Contacts">
                    {(contactFields, { add, remove }) => (
                      <div className="flex flex-col gap-y-4">
                        {contactFields.map((contactField, index) => (
                          <Space key={contactField.key}>
                            <Form.Item
                              noStyle
                              name={[contactField.name, 'contact']}
                              hasFeedback
                              validateFirst
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
                                ({ getFieldValue }) => ({
                                  validator(_, value) {
                                    if (
                                      !value ||
                                      !getFieldValue('Contacts') ||
                                      (getFieldValue('Contacts') as { contact: string }[]).reduce(
                                        (c, contact) => (contact?.contact === value ? c + 1 : c),
                                        0,
                                      ) === 1
                                    ) {
                                      setHasContactError(false);
                                      return Promise.resolve();
                                    }
                                    setHasContactError(true);
                                    return Promise.reject(
                                      new Error(t('DuplicateContact').replace('{0}', t(getContactType(index)))),
                                    );
                                  },
                                }),
                              ]}
                            >
                              <Input
                                prefix={isEmailContact(index) ? <IconMail /> : <IconPhone />}
                                placeholder={t('Your') + ' ' + t('Email') + ' / ' + t('Phone')}
                              />
                            </Form.Item>
                            <IconX
                              className={twMerge(
                                form.getFieldValue('Contacts').at(0)?.contact ? 'cursor-pointer' : 'hidden',
                              )}
                              onClick={() => {
                                if (contactFields.length === 1) form.resetFields(['Contacts']); // Just clear the field
                                else remove(contactField.name); // Remove the selected field
                              }}
                            />
                          </Space>
                        ))}
                        <Button
                          type="dashed"
                          icon={<IconPlus style={{ display: 'flex' }} />}
                          disabled={
                            form.getFieldValue('Contacts').some((contact?: { contact: string }) => !contact?.contact) ||
                            form.getFieldError('Contacts').length > 0 ||
                            form.getFieldValue('Contacts').length !== contactFields.length ||
                            contactFields.length >= 5 ||
                            hasContactError ||
                            sending
                          }
                          onClick={() => add()}
                        >
                          {t('AddContact')}
                        </Button>
                      </div>
                    )}
                  </Form.List>
                </Form.Item>
                <Form.Item<FieldType>
                  label={t('Message')}
                  name="Message"
                  hasFeedback
                  wrapperCol={{ xs: 18, sm: 20 }}
                  rules={[
                    { required: true, message: getErrorMessage('Message', FieldError.Required) },
                    { min: 20, message: getErrorMessage('Message', FieldError.Min, 20) },
                  ]}
                >
                  <TextArea
                    id="message"
                    name="message"
                    showCount={isMessageValid}
                    autoSize={{ minRows: 2 }}
                    maxLength={500}
                    placeholder={t('Your') + ' ' + t('Message')}
                  />
                </Form.Item>
                <Form.Item className="flex justify-end" style={{ paddingTop: 16 }}>
                  <Button
                    icon={<IconSend style={{ display: 'flex' }} />}
                    iconPosition="start"
                    disabled={!isFormValid}
                    loading={sending}
                    type="primary"
                    htmlType="submit"
                  >
                    {t('SendMessage')}
                  </Button>
                </Form.Item>
              </Form>
            </div>
            <div>
              <div className="space-y-4 mb-8 hidden md:block">
                <h2 className="text-2xl font-semibold mb-4">{t('ContactInformation')}</h2>
                <div className="space-y-4 justify-self-center">
                  <div className="flex items-start">
                    <IconMapPin className="mr-2 mt-1" size={18} />
                    <div>
                      <p className="font-semibold">{t('Address')}:</p>
                      {companyInfo.address.split(',').map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <IconPhone className="mr-2" size={18} />
                    <div>
                      <p className="font-semibold">{t('Phone')}:</p>
                      <p>
                        <Link href={`tel:${getPhoneNumber(companyInfo.phone)}`}>{companyInfo.phone}</Link>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <IconMail className="mr-2" size={18} />
                    <div>
                      <p className="font-semibold">{t('Email')}:</p>
                      <p>
                        <Link href={`mailto:${companyInfo.email}`}>{companyInfo.email}</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">{t('BusinessHours')}</h3>
                <div className="justify-self-center">
                  <p>{t('BusinessHoursDescription')}</p>
                  <p>{t('ReplyTime')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
