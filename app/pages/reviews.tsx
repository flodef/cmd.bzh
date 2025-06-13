'use client';

import { IconChevronDown, IconChevronUp, IconMail, IconSend, IconStar, IconUser } from '@tabler/icons-react';
import { Button, Card, Empty, Form, FormProps, Input, InputRef, message, Modal, Rate, Spin, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Page, useMenuContext } from '../contexts/menuProvider';
import { emailRegex, textColor } from '../utils/constants';
import { t } from '../utils/i18n';

const { TextArea } = Input;
const { Text } = Typography;

const REVIEWS_PER_PAGE = 3;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    setLoading(true);
    // This would normally be an API call
    setTimeout(() => {
      const mockReviews: Review[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          comment:
            'Great service! The team was professional and did an amazing job with our garden maintenance. Great service! The team was professional and did an amazing job with our garden maintenance.',
          rating: 5,
          createdAt: '2023-06-12T10:00:00Z',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          comment: 'Very satisfied with the window cleaning service. Prompt and efficient. Will use again.',
          rating: 4.5,
          createdAt: '2023-06-10T14:30:00Z',
        },
        {
          id: '3',
          name: 'Robert Johnson',
          email: 'robert.j@example.com',
          comment: 'Good cleaning service but could be more thorough in some areas.',
          rating: 3.5,
          createdAt: '2023-06-01T09:15:00Z',
        },
        {
          id: '4',
          name: 'Marie Dubois',
          email: 'marie.d@example.com',
          comment:
            "Excellente prestation pour l'entretien de notre résidence secondaire. Service fiable et professionel.",
          rating: 5,
          createdAt: '2023-05-25T11:45:00Z',
        },
        {
          id: '5',
          name: 'Thomas Martin',
          email: 'thomas.m@example.com',
          comment: 'Très bon service de jardinage. Les équipes sont ponctuelles et soigneuses. Je recommande vivement.',
          rating: 4,
          createdAt: '2023-05-15T16:20:00Z',
        },
        {
          id: '6',
          name: 'John Doe',
          email: 'john.doe@example.com',
          comment: 'Great service! The team was professional and did an amazing job with our garden maintenance.',
          rating: 5,
          createdAt: '2023-06-12T10:00:00Z',
        },
        {
          id: '7',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          comment: 'Very satisfied with the window cleaning service. Prompt and efficient. Will use again.',
          rating: 4.5,
          createdAt: '2023-06-10T14:30:00Z',
        },
        {
          id: '8',
          name: 'Robert Johnson',
          email: 'robert.j@example.com',
          comment: 'Good cleaning service but could be more thorough in some areas.',
          rating: 3.5,
          createdAt: '2023-06-01T09:15:00Z',
        },
        {
          id: '9',
          name: 'Marie Dubois',
          email: 'marie.d@example.com',
          comment:
            "Excellente prestation pour l'entretien de notre résidence secondaire. Service fiable et professionel.",
          rating: 5,
          createdAt: '2023-05-25T11:45:00Z',
        },
        {
          id: '10',
          name: 'Thomas Martin',
          email: 'thomas.m@example.com',
          comment: 'Très bon service de jardinage. Les équipes sont ponctuelles et soigneuses. Je recommande vivement.',
          rating: 4,
          createdAt: '2023-05-15T16:20:00Z',
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

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  // Reference for the scrollable container
  const reviewsContainerRef = useRef<HTMLDivElement>(null);

  // Fixed height constants
  const REVIEW_HEIGHT = 140; // Reduced height of each card in pixels
  const REVIEW_SPACING = 24; // Height of spacing between cards (margin-bottom)
  const REVIEW_TOTAL_HEIGHT = REVIEW_HEIGHT + REVIEW_SPACING; // Combined height of card + spacing

  // Calculate the max page for pagination
  const maxPage = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  
  // Update current page based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (isTransitioning || !reviewsContainerRef.current) return;
      
      const container = reviewsContainerRef.current;
      const scrollTop = container.scrollTop;
      
      // Calculate which page we're on based on scroll position
      const estimatedPage = Math.floor(scrollTop / (REVIEW_TOTAL_HEIGHT * REVIEWS_PER_PAGE)) + 1;
      const calculatedPage = Math.min(Math.max(1, estimatedPage), maxPage);
      
      if (calculatedPage !== currentPage) {
        setCurrentPage(calculatedPage);
      }
    };
    
    const container = reviewsContainerRef.current;
    if (container) {
      // Add throttled scroll event listener with small delay to avoid performance issues
      let scrollTimeout: ReturnType<typeof setTimeout>;
      const throttledScrollHandler = () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 100); // 100ms throttle
      };
      
      container.addEventListener('scroll', throttledScrollHandler);
      
      return () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        container.removeEventListener('scroll', throttledScrollHandler);
      };
    }
  }, [currentPage, isTransitioning, maxPage, REVIEW_TOTAL_HEIGHT]);

  // Modal state for review details
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const handleScrollDown = () => {
    if (currentPage < maxPage && !isTransitioning) {
      setIsTransitioning(true);

      // Calculate position to scroll down by 3 reviews
      const container = reviewsContainerRef.current;
      if (container) {
        // For going down, we need to jump 3 reviews ahead
        const nextPage = currentPage + 1;
        const targetIndex = (nextPage - 1) * REVIEWS_PER_PAGE;
        const nextScrollPosition = REVIEW_TOTAL_HEIGHT * targetIndex;

        container.scrollTo({
          top: nextScrollPosition,
          behavior: 'smooth',
        });
      }

      setCurrentPage(currentPage + 1);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const handleScrollUp = () => {
    if (currentPage > 1 && !isTransitioning) {
      setIsTransitioning(true);

      // Calculate position to scroll up by exactly 3 reviews from current position
      const container = reviewsContainerRef.current;
      if (container) {
        // Get the current scroll position
        const currentScrollTop = container.scrollTop;
        
        // Calculate how many reviews to scroll up (always 3)
        const scrollUpAmount = REVIEW_TOTAL_HEIGHT * REVIEWS_PER_PAGE;
        
        // New position is current position minus 3 reviews' height
        const prevScrollPosition = Math.max(0, currentScrollTop - scrollUpAmount);

        container.scrollTo({
          top: prevScrollPosition,
          behavior: 'smooth',
        });
      }

      setCurrentPage(currentPage - 1);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  // Function to open modal with review details
  const openReviewModal = (review: Review) => {
    setSelectedReview(review);
    setModalVisible(true);
  };

  return (
    <>
      {/* Review detail modal */}
      {selectedReview && (
        <Modal
          title={
            <div className="flex justify-between items-center">
              <span className="font-semibold">{selectedReview.name}</span>
              <span className="text-sm text-gray-500 mr-8">{formatDate(selectedReview.createdAt)}</span>
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          centered
        >
          <div className="mb-3">
            <Rate disabled allowHalf defaultValue={selectedReview.rating} />
          </div>
          <div className={`${textColor} mt-4`}>{selectedReview.comment}</div>
        </Modal>
      )}
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{t('ReviewAllReviews')}</h2>
                {reviews.length > 0 && (
                  <div className="flex items-center">
                    <IconStar size={20} className="text-yellow-500 mr-1" />
                    <span className="font-semibold">{getAverageRating()}</span>
                    <span className="text-gray-500 text-sm ml-1">/ {reviews.length}</span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Empty description={t('ReviewNoReviews')} />
                </div>
              ) : (
                <div>
                  {/* Up arrow for scrolling - only shown when not on first page */}
                  {currentPage > 1 && (
                    <div className="flex justify-center">
                      <Button
                        type="text"
                        icon={<IconChevronUp size={28} style={{ display: 'flex' }} />}
                        onClick={handleScrollUp}
                        disabled={isTransitioning}
                      />
                    </div>
                  )}

                  {/* Reviews cards in scrollable container with hidden scrollbar */}
                  <div
                    ref={reviewsContainerRef}
                    className="space-y-6 overflow-y-auto relative"
                    style={{
                      height: `${REVIEW_HEIGHT * 3 + REVIEW_SPACING * 2}px`, // Exact height for 3 reviews with spacing between them
                      scrollbarWidth: 'none', // Hide scrollbar for Firefox
                      msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
                      scrollBehavior: 'smooth', // Add native smooth scrolling
                      scrollSnapType: 'y mandatory', // Snap to reviews when scrolling
                    }}
                  >
                    {/* CSS to hide scrollbar for Chrome/Safari */}
                    <style jsx>{`
                      div::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>

                    {/* Render all reviews, not just current page */}
                    {reviews.length === 0 ? (
                      <div className="py-20 flex justify-center">
                        <Empty description={t('ReviewNoReviews')} />
                      </div>
                    ) : (
                      reviews.map(review => (
                        <Card
                          key={review.id}
                          className="w-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          style={{
                            height: `${REVIEW_HEIGHT}px`, // Fixed height for each review card
                            scrollSnapAlign: 'start', // Snap align for smooth scrolling
                          }}
                          onClick={() => openReviewModal(review)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Text strong className="text-lg">
                              {review.name}
                            </Text>
                            <Text type="secondary" className="text-sm">
                              {formatDate(review.createdAt)}
                            </Text>
                          </div>
                          <Rate disabled allowHalf defaultValue={review.rating} className="mb-2" />
                          <p
                            className={`${textColor} line-clamp-2 overflow-hidden`}
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {review.comment}
                          </p>
                        </Card>
                      ))
                    )}
                  </div>

                  {/* Down arrow for scrolling - only shown when not on last page */}
                  {currentPage < maxPage && (
                    <div className="flex justify-center">
                      <Button
                        type="text"
                        icon={<IconChevronDown size={28} style={{ display: 'flex' }} />}
                        onClick={handleScrollDown}
                        disabled={isTransitioning}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
