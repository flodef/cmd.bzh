'use client';

import { IconMail, IconMapPin, IconPhone, IconSend, IconUser, IconX } from '@tabler/icons-react';
import { Button, Form, FormProps, Input, InputRef, Space } from 'antd';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { companyInfo } from '../constants';
import { t } from '../i18n';

const { TextArea } = Input;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+?\d{1,3}?[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

const onFinish: FormProps<FieldType>['onFinish'] = values => {
  console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = errorInfo => {
  console.log('Failed:', errorInfo);
};

export default function Contact() {
  const nameRef = useRef<InputRef>(null);

  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setIsFormValid(true))
      .catch(() => setIsFormValid(false));

    console.log(values);
  }, [form, values]);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const getErrorMessage = (fieldName: string, fieldError?: FieldError, info?: string | number) => {
    switch (fieldError) {
      case FieldError.Min:
        return t('FieldMin').replace('{0}', fieldName).replace('{1}', String(info));
      case FieldError.Max:
        return t('FieldMax').replace('{0}', fieldName).replace('{1}', String(info));
      case FieldError.Required:
        return t('FieldRequired').replace('{0}', fieldName);
      default:
        return t(fieldName + 'Error');
    }
  };

  const [contactsInfo, setContactsInfo] = useState<{ value: string; type: ContactType; isValid: boolean }[]>([]);
  const onContactChange = (value: string, index: number) => {
    const isEmail = /[^0-9+-.\s]/.test(value);
    contactsInfo[index] = {
      value: value,
      type: isEmail ? ContactType.Email : ContactType.Phone,
      isValid: isEmail ? emailRegex.test(value) : phoneRegex.test(value),
    };

    setContactsInfo([...contactsInfo]);
  };

  const isEmailContact = (index: number) => contactsInfo[index]?.type === ContactType.Email;

  return (
    <>
      <section className="py-12">
        <div className="md:mx-4 px-4">
          <h1 className="text-4xl font-bold text-center mb-8">{t('ContactUs')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t('GetInTouch')}</h2>
              <Form
                name="contactInfo"
                form={form}
                layout={'horizontal'}
                size="large"
                scrollToFirstError={{ behavior: 'smooth', block: 'start' }}
                style={{ maxWidth: 600 }}
                labelCol={{ xs: 6, lg: 5 }}
                wrapperCol={{ xs: 18, sm: 12, md: 18, lg: 14, xl: 12 }}
                initialValues={{ name: '', contacts: [{ contact: '' }], message: '' }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                requiredMark={false}
                validateTrigger="onChange"
                autoComplete="on"
              >
                <Form.Item<FieldType>
                  label={t('Name')}
                  name="name"
                  hasFeedback
                  rules={[
                    { required: true, message: getErrorMessage('Name', FieldError.Required) },
                    { min: 5, message: getErrorMessage('Name', FieldError.Min, 5) },
                    { max: 50, message: getErrorMessage('Name', FieldError.Max, 50) },
                    { pattern: /^[a-zA-Z\s]+$/, message: getErrorMessage('Name') },
                  ]}
                >
                  <Input prefix={<IconUser />} ref={nameRef} placeholder={t('Your') + ' ' + t('Name')} />
                </Form.Item>
                <Form.Item label="Contact(s)">
                  <Form.List name="contacts">
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
                                  message: getErrorMessage(contactsInfo[index]?.type ?? '', FieldError.Min, 10),
                                },
                                {
                                  max: 50,
                                  message: getErrorMessage(contactsInfo[index]?.type ?? '', FieldError.Max, 50),
                                },
                                {
                                  pattern: isEmailContact(index) ? emailRegex : phoneRegex,
                                  message: getErrorMessage(isEmailContact(index) ? 'Email' : 'Phone'),
                                },
                              ]}
                            >
                              <Input
                                prefix={isEmailContact(index) ? <IconMail /> : <IconPhone />}
                                onChange={e => onContactChange(e.target.value, index)}
                                placeholder={t('Your') + ' ' + t('Email') + ' / ' + t('Phone')}
                              />
                            </Form.Item>
                            <IconX
                              className="cursor-pointer"
                              onClick={() => {
                                if (contactFields.length === 1) {
                                  add();
                                }

                                remove(contactField.name);
                                contactsInfo.splice(index, 1);
                              }}
                            />
                          </Space>
                        ))}
                        <Button
                          type="dashed"
                          disabled={
                            contactsInfo.some(contact => !contact.isValid || contact.value === '') ||
                            contactsInfo.length !== contactFields.length ||
                            contactFields.length >= 5
                          }
                          onClick={add}
                        >
                          + {t('AddContact')}
                        </Button>
                      </div>
                    )}
                  </Form.List>
                </Form.Item>
                <Form.Item<FieldType>
                  label={t('Message')}
                  name="message"
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
                    showCount
                    autoSize={{ minRows: 2 }}
                    maxLength={500}
                    placeholder={t('Your') + ' ' + t('Message')}
                  />
                </Form.Item>
                <Form.Item className="flex justify-end" style={{ paddingTop: 16 }}>
                  <Button icon={<IconSend />} iconPosition="start" disabled={!isFormValid}>
                    {t('SendMessage')}
                  </Button>
                </Form.Item>
              </Form>
            </div>
            <div>
              <div className="space-y-4 mb-8 hidden md:block">
                <h2 className="text-2xl font-semibold mb-4">{t('ContactInformation')}</h2>
                <div className="flex items-start">
                  <IconMapPin className="mr-2 mt-1" size={18} />
                  <div>
                    <p className="font-semibold">{t('Address')}:</p>
                    {companyInfo.address.split(',').map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <IconPhone className="mr-2" size={18} />
                  <div>
                    <p className="font-semibold">{t('Phone')}:</p>
                    <p>
                      <Link href={`tel:${companyInfo.phone.replaceAll(' ', '')}`}>{companyInfo.phone}</Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <IconMail className="mr-2" size={18} />
                  <div>
                    <p className="font-semibold">{t('Email')}:</p>
                    <p>
                      <Link href={`mailto:${companyInfo.email}`}>{companyInfo.email}</Link>
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">{t('BusinessHours')}</h3>
                <p>{t('BusinessHoursDescription')}</p>
                <p>{t('ReplyTime')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

type FieldType = {
  name?: string;
  contacts?: string[];
  message?: string;
};

enum FieldError {
  Min = 'min',
  Max = 'max',
  Required = 'required',
}

enum ContactType {
  Email = 'Email',
  Phone = 'Phone',
}
