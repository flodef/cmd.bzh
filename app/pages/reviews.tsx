'use client';

import { IconChevronDown, IconChevronUp, IconMail, IconSend, IconStar, IconUser } from '@tabler/icons-react';
import { Button, Card, Empty, Form, FormProps, Input, InputRef, message, Modal, Rate, Spin, Typography } from 'antd';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Page, useMenuContext } from '../contexts/menuProvider';
import { emailRegex, STORAGE_KEYS, textColor } from '../utils/constants';
import { t } from '../utils/i18n';
import { submitNewReview, getReviews } from '../actions/reviews';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/localStorage';

const { TextArea } = Input;
const { Text } = Typography;

const REVIEWS_PER_PAGE = 3;

// Cooldown period in milliseconds (15 minutes)
const SUBMIT_COOLDOWN = 15 * 60 * 1000;

interface Review {
  id: string;
  name: string;
  email: string;
  comment: string;
  rating: number;
  createdAt: string;
  pending?: boolean;
}

interface ReviewFormValues {
  id?: string;
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
  const [formChanged, setFormChanged] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCommentValid, setIsCommentValid] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // States for editing mode and cooldown
  const [pendingReview, setPendingReview] = useState<ReviewFormValues | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const nameRef = useRef<InputRef>(null);

  // Function to check and update cooldown status
  const checkCooldown = useCallback(() => {
    const lastSubmitTime = getLocalStorageItem<number>(STORAGE_KEYS.LAST_SUBMIT_TIME, 0);
    if (lastSubmitTime) {
      const now = Date.now();
      const elapsed = now - lastSubmitTime;

      setCooldownRemaining(elapsed < SUBMIT_COOLDOWN ? Math.ceil((SUBMIT_COOLDOWN - elapsed) / 1000) : 0);
    } else {
      setCooldownRemaining(0);
    }
  }, []);

  // Fetch published reviews from the database
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch reviews from the server
      const dbReviews = await getReviews();

      // Only show published reviews from the database
      const combinedReviews: Review[] = [
        ...dbReviews.map(dbReview => ({
          id: dbReview.id,
          name: dbReview.name,
          email: dbReview.email,
          comment: dbReview.comment,
          rating: dbReview.rating,
          createdAt: dbReview.created_at,
        })),
      ];

      setReviews(combinedReviews);

      // Check cooldown status
      checkCooldown();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      messageApi.error(t('ReviewsFetchError'));
    } finally {
      setLoading(false);
    }
  }, [messageApi, checkCooldown]);

  // Handle status hash fragment for review validation success/failure
  useEffect(() => {
    // Parse hash fragment if available (e.g., #status=approved)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1); // remove the # character
      const params = new URLSearchParams(hash);
      const status = params.get('status');
      const message = params.get('message');

      if (status === 'approved') {
        messageApi.success(t('ReviewApproved'));
      } else if (status === 'rejected') {
        messageApi.info(t('ReviewRejected'));
      } else if (status === 'notfound') {
        messageApi.error(t('ReviewNotFound'));
      } else if (status === 'error') {
        if (message === 'publication') {
          messageApi.error(t('ReviewPublicationError'));
        } else if (message === 'deletion') {
          messageApi.error(t('ReviewDeletionError'));
        } else {
          messageApi.error(t('ReviewGenericError'));
        }
      }

      // Remove hash to prevent showing the message on refresh
      // Keep the tab parameter if it exists
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }, [messageApi]);

  // Initialize form with values from localStorage
  const initFormFromLocalStorage = useCallback(() => {
    const storedReview = getLocalStorageItem<ReviewFormValues>(STORAGE_KEYS.PENDING_REVIEW);
    if (storedReview) {
      setPendingReview(storedReview);
      setIsEditing(true);

      // Pre-fill the form with stored review values
      form.setFieldsValue({
        name: storedReview.name,
        email: storedReview.email,
        comment: storedReview.comment,
        rating: storedReview.rating,
      });
    }
  }, [form]);

  useEffect(() => {
    fetchReviews();
    initFormFromLocalStorage();

    // Set up cooldown check interval
    cooldownIntervalRef.current = setInterval(() => {
      checkCooldown();
    }, 1000); // Update every second

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [fetchReviews, checkCooldown, initFormFromLocalStorage]);

  useEffect(() => {
    if (activeTab !== Page.Reviews) return;
    // Only refetch if needed
    nameRef.current?.focus();
  }, [activeTab]);

  useEffect(() => {
    // Check if the form is valid
    form
      .validateFields()
      .then(() => {
        setIsFormValid(true);
      })
      .catch(() => {
        setIsFormValid(false);
      });

    // Check if form values have changed from the original pendingReview
    if (pendingReview && isEditing) {
      const currentValues = form.getFieldsValue();
      const hasChanged =
        currentValues.name !== pendingReview.name ||
        currentValues.email !== pendingReview.email ||
        currentValues.comment !== pendingReview.comment ||
        currentValues.rating !== pendingReview.rating;

      setFormChanged(hasChanged);
    }
  }, [form, values, pendingReview, isEditing]);

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

  // Direct update review without requiring re-approval
  const updateReviewDirectly = async (
    values: ReviewFormValues,
    reviewId: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // Call the API to update the review without requiring approval
      const response = await fetch('/api/reviews/update-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reviewId,
          name: values.name,
          email: values.email,
          rating: values.rating,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating review directly:', error);
      return { success: false, message: 'Failed to update review' };
    }
  };

  // Handle submitting a review
  const onFinish: FormProps<ReviewFormValues>['onFinish'] = async values => {
    if (submitting) return;

    // Check cooldown for all submissions
    const lastSubmitTime = getLocalStorageItem<number>(STORAGE_KEYS.LAST_SUBMIT_TIME, 0);
    if (lastSubmitTime) {
      const now = Date.now();
      const elapsed = now - lastSubmitTime;

      if (elapsed < SUBMIT_COOLDOWN) {
        const remainingMinutes = Math.floor((SUBMIT_COOLDOWN - elapsed) / 60000);
        const remainingSeconds = Math.floor(((SUBMIT_COOLDOWN - elapsed) % 60000) / 1000);
        messageApi.error(
          t('ReviewCooldownActive')
            .replace('{{minutes}}', String(remainingMinutes))
            .replace('{{seconds}}', String(remainingSeconds)),
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      // If we're editing and only name/email/rating has changed (not comment)
      if (isEditing && pendingReview && pendingReview.id) {
        const commentChanged = values.comment !== pendingReview.comment;

        if (!commentChanged) {
          // Direct update without approval
          const result = await updateReviewDirectly(values, pendingReview.id);

          if (result.success) {
            // Update the pending review with new values but keep the existing ID
            const updatedReview: ReviewFormValues = {
              ...values,
              id: pendingReview.id,
            };

            // Store updated review and reset last submission time
            setLocalStorageItem(STORAGE_KEYS.PENDING_REVIEW, updatedReview);
            setLocalStorageItem(STORAGE_KEYS.LAST_SUBMIT_TIME, Date.now());

            // Update UI state
            setPendingReview(updatedReview);
            setFormChanged(false);
            setCooldownRemaining(SUBMIT_COOLDOWN / 1000);

            // Refresh the reviews list to reflect the changes
            fetchReviews();

            messageApi.success(t('ReviewUpdatedDirect'));
          } else {
            throw new Error(result.message || 'Unknown error');
          }
        } else {
          // Comment changed, needs re-approval
          const result = await submitNewReview(values);

          if (result.success) {
            // Store the review in localStorage with ID from the server
            const reviewToStore: ReviewFormValues = {
              ...values,
              id: result.reviewId,
            };

            // Store pending review and set last submission time
            setLocalStorageItem(STORAGE_KEYS.PENDING_REVIEW, reviewToStore);
            setLocalStorageItem(STORAGE_KEYS.LAST_SUBMIT_TIME, Date.now());

            // Update UI state with the new review data
            setPendingReview(reviewToStore);
            setFormChanged(false);
            setCooldownRemaining(SUBMIT_COOLDOWN / 1000);

            messageApi.success(t('ReviewCommentChanged'));
          } else {
            throw new Error(result.message || 'Unknown error');
          }
        }
      } else {
        // New review submission
        const result = await submitNewReview(values);

        if (result.success) {
          // Store the review in localStorage with ID from the server
          const reviewToStore: ReviewFormValues = {
            ...values,
            id: result.reviewId,
          };

          // Store pending review and set last submission time
          setLocalStorageItem(STORAGE_KEYS.PENDING_REVIEW, reviewToStore);
          setLocalStorageItem(STORAGE_KEYS.LAST_SUBMIT_TIME, Date.now());

          // Update UI state
          setPendingReview(reviewToStore);
          setIsEditing(true);
          setCooldownRemaining(SUBMIT_COOLDOWN / 1000);

          messageApi.success(t('ReviewSuccess') + ' ' + t('PendingApproval'));
        } else {
          throw new Error(result.message || 'Unknown error');
        }
      }
    } catch (error) {
      console.error('Error handling review:', error);
      messageApi.error(t('ReviewError'));
    } finally {
      setSubmitting(false);
    }
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
    const total = reviews.reduce((sum, review) => {
      // Make sure we have a valid numeric rating (could be string from DB)
      const rating = typeof review.rating === 'string' ? parseFloat(review.rating) : review.rating;
      return sum + (isNaN(rating) ? 0 : rating);
    }, 0);
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

  // State for scroll position tracking
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  // Update scroll status based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!reviewsContainerRef.current) return;

      const container = reviewsContainerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const containerHeight = container.clientHeight;

      // Calculate which page we're on based on scroll position
      const estimatedPage = Math.floor(scrollTop / (REVIEW_TOTAL_HEIGHT * REVIEWS_PER_PAGE)) + 1;
      const calculatedPage = Math.min(Math.max(1, estimatedPage), maxPage);

      // Show up arrow if scrolled down at all
      setCanScrollUp(scrollTop > 1);

      // Show down arrow only if there are more than 3 reviews and not at the bottom
      // Add a small buffer (5px) to account for rounding errors
      setCanScrollDown(reviews.length > 3 && scrollTop + containerHeight < scrollHeight - 5);

      if (calculatedPage !== currentPage && !isTransitioning) {
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

      // Initial check
      handleScroll();

      return () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        container.removeEventListener('scroll', throttledScrollHandler);
      };
    }
  }, [currentPage, isTransitioning, maxPage, reviews.length, REVIEW_TOTAL_HEIGHT]);

  // Modal state for review details
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const handleScrollDown = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);

      // Calculate position to scroll down by exactly 3 reviews from current position
      const container = reviewsContainerRef.current;
      if (container) {
        // Get the current scroll position
        const currentScrollTop = container.scrollTop;

        // Calculate how many reviews to scroll down (always 3)
        const scrollDownAmount = REVIEW_TOTAL_HEIGHT * REVIEWS_PER_PAGE;

        // New position is current position plus 3 reviews' height
        const nextScrollPosition = Math.min(
          currentScrollTop + scrollDownAmount,
          container.scrollHeight - container.clientHeight,
        );

        container.scrollTo({
          top: nextScrollPosition,
          behavior: 'smooth',
        });
      }

      setTimeout(() => {
        // Update page after scrolling
        const container = reviewsContainerRef.current;
        if (container) {
          const newPage = Math.floor(container.scrollTop / (REVIEW_TOTAL_HEIGHT * REVIEWS_PER_PAGE)) + 1;
          setCurrentPage(Math.min(newPage, maxPage));
        }
        setIsTransitioning(false);
      }, 500);
    }
  };

  const handleScrollUp = () => {
    if (!isTransitioning) {
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

      setTimeout(() => {
        // Update page after scrolling
        const container = reviewsContainerRef.current;
        if (container) {
          const newPage = Math.floor(container.scrollTop / (REVIEW_TOTAL_HEIGHT * REVIEWS_PER_PAGE)) + 1;
          setCurrentPage(Math.max(1, newPage));
        }
        setIsTransitioning(false);
      }, 500);
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
            <Rate disabled allowHalf value={selectedReview.rating} />
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
              <h2 className="text-2xl font-semibold mb-4">{isEditing ? t('ReviewEditTitle') : t('ReviewFormTitle')}</h2>

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
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    disabled={!isFormValid || cooldownRemaining > 0 || (isEditing && !formChanged)}
                    icon={<IconSend style={{ display: 'flex' }} />}
                  >
                    {submitting
                      ? t('ReviewSubmitting')
                      : cooldownRemaining > 0
                      ? `${isEditing ? t('ReviewUpdate') : t('ReviewSubmit')} (${Math.floor(cooldownRemaining / 60)}:${(
                          cooldownRemaining % 60
                        )
                          .toString()
                          .padStart(2, '0')})`
                      : isEditing
                      ? t('ReviewUpdate')
                      : t('ReviewSubmit')}
                  </Button>
                </Form.Item>
              </Form>
            </div>

            {/* Reviews List - Right Column */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{t('ReviewAllReviews') + ' (' + reviews.length + ')'}</h2>
                {reviews.length > 0 && (
                  <div className="flex items-center">
                    <IconStar size={20} className="text-yellow-500 mr-1" />
                    <span className="font-semibold">{getAverageRating()}</span>
                    <span className="text-gray-500 text-sm ml-1">/ 5</span>
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
                  {/* Up arrow for scrolling - always present but only visible when scrolled down */}
                  <div className="flex justify-center">
                    <Button
                      type="text"
                      icon={<IconChevronUp size={28} style={{ display: 'flex' }} />}
                      onClick={handleScrollUp}
                      disabled={isTransitioning}
                      style={{ opacity: canScrollUp ? 1 : 0, transition: 'opacity 0.3s' }}
                    />
                  </div>

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

                  {/* Down arrow for scrolling - always present but only visible when not at bottom */}
                  <div className="flex justify-center mt-2">
                    <Button
                      type="text"
                      icon={<IconChevronDown size={28} style={{ display: 'flex' }} />}
                      onClick={handleScrollDown}
                      disabled={isTransitioning}
                      style={{ opacity: canScrollDown ? 1 : 0, transition: 'opacity 0.3s' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
