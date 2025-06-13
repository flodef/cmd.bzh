'use client';

import { IconMail, IconSend, IconUser } from '@tabler/icons-react';
import { Button, Card, Empty, Form, FormProps, Input, InputRef, message, Rate, Spin, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Page, useMenuContext } from '../contexts/menuProvider';
import { emailRegex, textColor } from '../utils/constants';
import { t } from '../utils/i18n';

const { TextArea } = Input;
const { Text } = Typography;

interface Review {
  id: string;
  name: string;
  email: string;
  comment: string;
  rating: number;
  createdAt: string;
}

interface ReviewFormValues {
  name: string;
  email: string;
  comment: string;
  rating: number;
}

enum FieldError {
  Min = 'min',
  Max = 'max',
  Required = 'required',
}

export default function Reviews() {
  const { activeTab } = useMenuContext();

  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  const [submitting, setSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCommentValid, setIsCommentValid] = useState<boolean>(true);

  const nameRef = useRef<InputRef>(null);
  useEffect(() => {
    if (activeTab !== Page.Reviews) return;
    fetchReviews();
    nameRef.current?.focus();
  }, [activeTab]);

  useEffect(() => {
    form
      .validateFields(['comment'], { validateOnly: true })
      .then(() => {
        setIsCommentValid(true);
        form
          .validateFields({ validateOnly: true })
          .then(() => setIsFormValid(true))
          .catch(() => setIsFormValid(false));
      })
      .catch(() => {
        setIsCommentValid(false);
        setIsFormValid(false);
      });
  }, [form, values]);

  useEffect(() => {}, [form, values]);

  // Mock function to simulate getting reviews
  const fetchReviews = () => {
    // This would normally be an API call
    setLoading(true);
    setTimeout(() => {
      // Mock data
      const mockReviews: Review[] = [
        {
          id: '1',
          name: 'Jean Dupont',
          email: 'jean@example.com',
          comment: 'Service exceptionnel ! La maison était impeccable.',
          rating: 5,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'Marie Lefevre',
          email: 'marie@example.com',
          comment: 'Très satisfaite du service de jardinage. Personnel ponctuel et professionnel.',
          rating: 4.5,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'Pierre Martin',
          email: 'pierre@example.com',
          comment: "Excellente conciergerie, toujours à l'écoute et très réactifs.",
          rating: 5,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  };

  // Mock function to simulate submitting a review
  const onFinish: FormProps<ReviewFormValues>['onFinish'] = values => {
    setSubmitting(true);
    // This would normally be an API call
    setTimeout(() => {
      try {
        const newReview: Review = {
          id: Date.now().toString(),
          name: values.name,
          email: values.email,
          comment: values.comment,
          rating: values.rating,
          createdAt: new Date().toISOString(),
        };

        setReviews([newReview, ...reviews]);
        form.resetFields();
        messageApi.success(t('ReviewSuccess'));
      } catch (error) {
        console.error('Error:', error);
        messageApi.error(t('ReviewError'));
      } finally {
        setSubmitting(false);
      }
    }, 1000);
  };

  const onFinishFailed: FormProps<ReviewFormValues>['onFinishFailed'] = errorInfo => {
    console.error('Failed:', errorInfo);
    messageApi.error(t('ReviewError'));
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      {contextHolder}
      <section className="py-12">
        <div className="md:mx-4 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
            {/* Add Review Form - Left Column */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t('AddReview')}</h2>

              <Form
                name="reviewForm"
                form={form}
                layout={'horizontal'}
                size="large"
                disabled={submitting}
                scrollToFirstError={{ behavior: 'smooth', block: 'start' }}
                style={{ maxWidth: 600 }}
                labelCol={{ xs: 6, lg: 5 }}
                wrapperCol={{ xs: 18, sm: 12, md: 18, lg: 14, xl: 12 }}
                initialValues={{ rating: 5 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                requiredMark={false}
                validateTrigger="onChange"
                autoComplete="on"
              >
                <Form.Item
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
                  <Input ref={nameRef} prefix={<IconUser />} placeholder={t('Your') + ' ' + t('Name')} />
                </Form.Item>

                <Form.Item
                  label={t('Email')}
                  name="email"
                  hasFeedback
                  rules={[
                    { required: true, message: getErrorMessage('Email', FieldError.Required) },
                    {
                      min: 10,
                      message: getErrorMessage('Email', FieldError.Min, 10),
                    },
                    {
                      max: 50,
                      message: getErrorMessage('Email', FieldError.Max, 50),
                    },
                    {
                      pattern: emailRegex,
                      message: getErrorMessage('Email'),
                    },
                  ]}
                >
                  <Input prefix={<IconMail />} placeholder={t('Your') + ' ' + t('Email')} />
                </Form.Item>

                <Form.Item
                  label={t('ReviewRating')}
                  name="rating"
                  rules={[{ required: true, message: getErrorMessage('ReviewRating', FieldError.Required) }]}
                >
                  <Rate allowHalf allowClear />
                </Form.Item>

                <Form.Item
                  label={t('Comment')}
                  name="comment"
                  hasFeedback
                  wrapperCol={{ xs: 18, sm: 20 }}
                  rules={[
                    { required: true, message: getErrorMessage('Message', FieldError.Required) },
                    { min: 20, message: getErrorMessage('Message', FieldError.Min, 20) },
                  ]}
                >
                  <TextArea
                    id="comment"
                    name="comment"
                    showCount={isCommentValid}
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
                    loading={submitting}
                    type="primary"
                    htmlType="submit"
                  >
                    {t('SubmitReview')}
                  </Button>
                </Form.Item>
              </Form>
            </div>

            {/* Reviews List - Right Column */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t('ReviewAllReviews')}</h2>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Empty description={t('ReviewNoReviews')} />
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <Card key={review.id} className="w-full shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <Text strong className="text-lg">
                          {review.name}
                        </Text>
                        <Text type="secondary" className="text-sm">
                          {formatDate(review.createdAt)}
                        </Text>
                      </div>
                      <Rate disabled allowHalf defaultValue={review.rating} className="mb-2" />
                      <p className={`${textColor}`}>{review.comment}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
