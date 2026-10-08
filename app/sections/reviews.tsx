'use client';

import { IconChevronDown, IconChevronUp, IconMail, IconSend, IconStar, IconUser } from '@tabler/icons-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Field, Form, useForm } from '../components/ui/form';
import { Input, TextArea } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import { Rate } from '../components/ui/rate';
import { Reveal } from '../components/ui/reveal';
import { Spin } from '../components/ui/spin';
import { Tag } from '../components/ui/tag';
import { useToast } from '../components/ui/toast';
import { emailRegex, STORAGE_KEYS } from '../utils/constants';
import { useReviewsCache } from '../contexts/reviewsCacheProvider';
import { t } from '../utils/i18n';
import { sendReview } from '../utils/reviewService';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/localStorage';

const REVIEWS_PER_PAGE = 3;

// Cooldown period in milliseconds (15 minutes)
const SUBMIT_COOLDOWN = 15 * 60 * 1000;

const bodyText = 'text-bark/80 dark:text-cream/80';

interface Review {
  id: string;
  name: string;
  email: string;
  comment: string;
  rating: number;
  createdAt: string;
  isPending?: boolean;
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
  const { fetchReviews: fetchCachedReviews } = useReviewsCache();
  const toast = useToast();

  const [form] = useForm<Record<string, unknown>>({ name: '', email: '', comment: '', rating: 5 });
  const values = form.values;

  const [submitting, setSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState<boolean>(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // States for editing mode and cooldown
  const [pendingReview, setPendingReview] = useState<ReviewFormValues | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Fetch published reviews from the database (cached at layout level)
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch reviews from the cache (or server if cache is stale)
      const dbReviews = await fetchCachedReviews();

      // Get the user's pending review from localStorage if it exists
      const storedReview = getLocalStorageItem<ReviewFormValues>(STORAGE_KEYS.PENDING_REVIEW);

      // Map database reviews to the Review type
      const publishedReviews = dbReviews.map(dbReview => ({
        id: dbReview.id,
        name: dbReview.name,
        email: dbReview.email,
        comment: dbReview.comment,
        rating: dbReview.rating,
        createdAt: dbReview.created_at,
        isPending: false,
      }));

      // Create combined reviews array
      let combinedReviews: (Review & { isPending?: boolean })[] = [...publishedReviews];

      // Check if we have a pending review
      if (storedReview) {
        // Check if the pending review is already in the published reviews
        const isAlreadyPublished = publishedReviews.some(r => r.id === storedReview.id);

        if (!isAlreadyPublished) {
          // Add the pending review at the top of the list - treat it as a regular published review
          combinedReviews = [
            {
              id: storedReview.id || 'pending',
              name: storedReview.name,
              email: storedReview.email,
              comment: storedReview.comment,
              rating: storedReview.rating,
              createdAt: new Date().toISOString(),
              isPending: true, // Mark it as pending for special styling
            },
            ...combinedReviews,
          ];
        }
      }

      setReviews(combinedReviews);

      // Check cooldown status
      checkCooldown();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error(t('ReviewsFetchError'));
    } finally {
      setLoading(false);
    }
  }, [fetchCachedReviews, toast, checkCooldown]);

  // Handle status hash fragment for review validation success/failure
  useEffect(() => {
    // Parse hash fragment if available (e.g., #status=approved)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1); // remove the # character
      const params = new URLSearchParams(hash);
      const status = params.get('status');
      const message = params.get('message');

      if (!status) return;

      if (status === 'approved') {
        toast.success(t('ReviewApproved'));
      } else if (status === 'rejected') {
        toast.info(t('ReviewRejected'));
      } else if (status === 'notfound') {
        toast.error(t('ReviewNotFound'));
      } else if (status === 'error') {
        if (message === 'publication') {
          toast.error(t('ReviewPublicationError'));
        } else if (message === 'deletion') {
          toast.error(t('ReviewDeletionError'));
        } else {
          toast.error(t('ReviewGenericError'));
        }
      }

      // Scroll to the reviews section so the user sees the result
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });

      // Remove hash to prevent showing the message on refresh
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }, [toast]);

  // Initialize form with values from localStorage
  const initFormFromLocalStorage = useCallback(() => {
    const storedReview = getLocalStorageItem<ReviewFormValues>(STORAGE_KEYS.PENDING_REVIEW);
    if (storedReview) {
      setPendingReview(storedReview);
      setIsEditing(true);

      // Pre-fill the form with stored review values without triggering validation
      form.setFields([
        { name: 'name', value: storedReview.name, touched: false },
        { name: 'email', value: storedReview.email, touched: false },
        { name: 'comment', value: storedReview.comment, touched: false },
        { name: 'rating', value: storedReview.rating, touched: false },
      ]);
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
    // Check if form values have changed from the original pendingReview
    if (pendingReview && isEditing) {
      const currentValues = form.getFieldsValue() as unknown as ReviewFormValues;
      const hasChanged =
        currentValues.name !== pendingReview.name ||
        currentValues.email !== pendingReview.email ||
        currentValues.comment !== pendingReview.comment ||
        currentValues.rating !== pendingReview.rating;

      setFormChanged(hasChanged);
    }
  }, [form, values, pendingReview, isEditing]);

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
  const onFinish = async (rawValues: Record<string, unknown>) => {
    if (submitting) return;
    const values = rawValues as unknown as ReviewFormValues;

    // Check cooldown for all submissions
    const lastSubmitTime = getLocalStorageItem<number>(STORAGE_KEYS.LAST_SUBMIT_TIME, 0);
    if (lastSubmitTime) {
      const now = Date.now();
      const elapsed = now - lastSubmitTime;

      if (elapsed < SUBMIT_COOLDOWN) {
        const remainingMinutes = Math.floor((SUBMIT_COOLDOWN - elapsed) / 60000);
        const remainingSeconds = Math.floor(((SUBMIT_COOLDOWN - elapsed) % 60000) / 1000);
        toast.error(
          t('ReviewCooldownActive', { minutes: String(remainingMinutes), seconds: String(remainingSeconds) }),
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

            // Immediately update the reviews list with the updated review
            const updatedReviewForList: Review = {
              id: updatedReview.id || 'pending',
              name: updatedReview.name,
              email: updatedReview.email,
              comment: updatedReview.comment,
              rating: updatedReview.rating,
              createdAt: new Date().toISOString(),
              isPending: true,
            };

            // Remove any existing pending review by this user and add the new one at the top
            const filteredReviews = reviews.filter(r => !(r.isPending && r.id === updatedReviewForList.id));
            setReviews([updatedReviewForList, ...filteredReviews]);

            toast.success(t('ReviewUpdatedDirect'));
          } else {
            throw new Error(result.message || 'Unknown error');
          }
        } else {
          // Comment changed, needs re-approval
          // Pass the existing review ID to update it rather than creating a new one
          const result = await sendReview({
            ...values,
            id: pendingReview.id, // Include the existing review ID
          });

          if (result.success) {
            // Store the review in localStorage with the same ID
            const reviewToStore: ReviewFormValues = {
              ...values,
              id: pendingReview.id, // Keep the same ID to prevent duplicates
            };

            // Store pending review and set last submission time
            setLocalStorageItem(STORAGE_KEYS.PENDING_REVIEW, reviewToStore);
            setLocalStorageItem(STORAGE_KEYS.LAST_SUBMIT_TIME, Date.now());

            // Update UI state with the new review data
            setPendingReview(reviewToStore);
            setFormChanged(false);
            setCooldownRemaining(SUBMIT_COOLDOWN / 1000);

            // Immediately update the reviews list with the updated review
            const updatedReviewForList: Review = {
              id: reviewToStore.id || 'pending',
              name: reviewToStore.name,
              email: reviewToStore.email,
              comment: reviewToStore.comment,
              rating: reviewToStore.rating,
              createdAt: new Date().toISOString(),
              isPending: true,
            };

            // Remove any existing pending review by this user and add the new one at the top
            const filteredReviews = reviews.filter(r => !(r.isPending && r.id === updatedReviewForList.id));
            setReviews([updatedReviewForList, ...filteredReviews]);

            toast.success(t('ReviewCommentChanged'));
          } else {
            throw new Error(result.message || 'Unknown error');
          }
        }
      } else {
        // New review submission
        const result = await sendReview(values);

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

          // Immediately update the reviews list with the new review
          const newReviewForList: Review = {
            id: reviewToStore.id || 'pending',
            name: reviewToStore.name,
            email: reviewToStore.email,
            comment: reviewToStore.comment,
            rating: reviewToStore.rating,
            createdAt: new Date().toISOString(),
            isPending: true,
          };

          // Add the new review at the top of the list
          setReviews([newReviewForList, ...reviews]);

          toast.success(t('ReviewSuccess'));
        } else {
          throw new Error(result.message || 'Unknown error');
        }
      }
    } catch (error) {
      console.error('Error handling review:', error);
      toast.error(t('ReviewError'));
    } finally {
      setSubmitting(false);
    }
  };

  const onFinishFailed = (errorInfo: unknown) => {
    console.error('Failed:', errorInfo);
    toast.error(t('ReviewError'));
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getAverageRating = () => {
    const publishedReviews = reviews.filter(r => !r.isPending);
    if (publishedReviews.length === 0) return 0;
    const total = publishedReviews.reduce((sum, review) => {
      // Make sure we have a valid numeric rating (could be string from DB)
      const rating = typeof review.rating === 'string' ? parseFloat(review.rating) : review.rating;
      return sum + (isNaN(rating) ? 0 : rating);
    }, 0);
    return (total / publishedReviews.length).toFixed(1);
  };

  // Reference for the scrollable container
  const reviewsContainerRef = useRef<HTMLDivElement>(null);

  // Fixed height constants
  const REVIEW_HEIGHT = 150; // Reduced height of each card in pixels
  const REVIEW_SPACING = 24; // Height of spacing between cards (margin-bottom)
  const REVIEW_TOTAL_HEIGHT = REVIEW_HEIGHT + REVIEW_SPACING; // Combined height of card + spacing

  // Calculate the max page for pagination
  const maxPage = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  // State for scroll position tracking
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);

  // Refs to avoid re-subscribing the scroll listener on every state change
  const currentPageRef = useRef(currentPage);
  const isTransitioningRef = useRef(isTransitioning);
  const maxPageRef = useRef(maxPage);
  const reviewsLengthRef = useRef(reviews.length);
  currentPageRef.current = currentPage;
  isTransitioningRef.current = isTransitioning;
  maxPageRef.current = maxPage;
  reviewsLengthRef.current = reviews.length;

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
      const calculatedPage = Math.min(Math.max(1, estimatedPage), maxPageRef.current);

      // Show up arrow if scrolled down at all
      setCanScrollUp(scrollTop > 1);

      // Show down arrow only if there are more than 3 reviews and not at the bottom
      // Add a small buffer (5px) to account for rounding errors
      setCanScrollDown(reviewsLengthRef.current > 3 && scrollTop + containerHeight < scrollHeight - 5);

      if (calculatedPage !== currentPageRef.current && !isTransitioningRef.current) {
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
  }, [REVIEW_TOTAL_HEIGHT]);

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
    <section id="reviews" className="scroll-mt-24 w-full max-w-7xl mx-auto">
      {/* Review detail modal */}
      {selectedReview && (
        <Modal
          title={
            <div className="flex justify-between items-center">
              <span className="font-semibold text-bark dark:text-cream">{selectedReview.name}</span>
              <span className="text-sm text-bark/50 dark:text-cream/50 mr-8">
                {formatDate(selectedReview.createdAt)}
              </span>
            </div>
          }
          open={modalVisible}
          onClose={() => setModalVisible(false)}
        >
          <div className="mb-3">
            <Rate disabled allowHalf value={selectedReview.rating} />
          </div>
          <div className={`${bodyText} mt-4`}>{selectedReview.comment}</div>
        </Modal>
      )}
      <Reveal className="px-4 py-20">
        <div
          className={loading || reviews.length > 0 ? 'grid grid-cols-1 md:grid-cols-2 md:gap-16' : 'max-w-2xl mx-auto'}
        >
          {/* Add Review Form - Left Column */}
          <div className="glass-soft glass-hover rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-6 text-bark dark:text-cream">
              {isEditing ? t('ReviewEditTitle') : t('ReviewFormTitle')}
            </h2>

            <Form form={form} onFinish={onFinish} onFinishFailed={onFinishFailed} disabled={submitting}>
              <Field
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
                <Input prefix={<IconUser />} placeholder={t('Your') + ' ' + t('Name')} />
              </Field>

              <Field
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
              </Field>

              <Field
                label={t('ReviewRating')}
                name="rating"
                rules={[{ required: true, message: getErrorMessage('ReviewRating', FieldError.Required) }]}
              >
                <Rate allowHalf allowClear />
              </Field>

              <Field
                label={t('Comment')}
                name="comment"
                hasFeedback
                rules={[
                  { required: true, message: getErrorMessage('Message', FieldError.Required) },
                  { min: 20, message: getErrorMessage('Message', FieldError.Min, 20) },
                ]}
              >
                <TextArea
                  id="comment"
                  name="comment"
                  showCount
                  minRows={3}
                  maxLength={500}
                  placeholder={t('Your') + ' ' + t('Message')}
                />
              </Field>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  type="submit"
                  loading={submitting}
                  disabled={cooldownRemaining > 0 || (isEditing && !formChanged)}
                  icon={<IconSend />}
                  iconPosition="start"
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
              </div>
            </Form>
          </div>

          {/* Reviews List - Right Column (hidden entirely when empty) */}
          {(loading || reviews.length > 0) && (
            <div className="glass-soft glass-hover rounded-3xl p-6 sm:p-8 mt-8 md:mt-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-bark dark:text-cream">
                  {t('ReviewAllReviews') + ' (' + reviews.filter(r => !r.isPending).length + ')'}
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center">
                    <IconStar size={20} className="text-yellow-500 mr-1" />
                    <span className="font-semibold text-bark dark:text-cream">{getAverageRating()}</span>
                    <span className="text-bark/50 dark:text-cream/50 text-sm ml-1">/ 5</span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin size={32} />
                </div>
              ) : (
                <div>
                  {/* Up arrow for scrolling - always present but only visible when scrolled down */}
                  <div className="flex justify-center">
                    <Button
                      variant="text"
                      icon={<IconChevronUp size={28} />}
                      onClick={handleScrollUp}
                      disabled={isTransitioning}
                      style={{ opacity: canScrollUp ? 1 : 0, transition: 'opacity 0.3s' }}
                      aria-label="Scroll up"
                    />
                  </div>

                  {/* Reviews cards in scrollable container with hidden scrollbar */}
                  <div
                    ref={reviewsContainerRef}
                    className="space-y-6 overflow-y-auto relative no-scrollbar"
                    style={{
                      height: `${REVIEW_HEIGHT * 3 + REVIEW_SPACING * 2}px`, // Exact height for 3 reviews with spacing between them
                      scrollBehavior: 'smooth', // Add native smooth scrolling
                      scrollSnapType: 'y mandatory', // Snap to reviews when scrolling
                    }}
                  >
                    {/* Render all reviews */}
                    {reviews.map(review => {
                      const isPending = 'isPending' in review && review.isPending;

                      return (
                        <Card
                          key={review.id}
                          hoverable
                          className={`w-full cursor-pointer ${isPending ? 'border-brand border-2' : ''}`}
                          style={{
                            height: `${REVIEW_HEIGHT}px`, // Fixed height for each review card
                            scrollSnapAlign: 'start', // Snap align for smooth scrolling
                          }}
                          onClick={() => openReviewModal(review)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-semibold text-lg text-bark dark:text-cream">{review.name}</span>
                              {isPending && <Tag className="ml-2">{t('PendingApproval')}</Tag>}
                            </div>
                            <span className="text-sm text-bark/50 dark:text-cream/50">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <Rate disabled allowHalf defaultValue={review.rating} className="mb-2" size={18} />
                          <p className={`${bodyText} line-clamp-2 overflow-hidden`}>{review.comment}</p>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Down arrow for scrolling - always present but only visible when not at bottom */}
                  <div className="flex justify-center mt-2">
                    <Button
                      variant="text"
                      icon={<IconChevronDown size={28} />}
                      onClick={handleScrollDown}
                      disabled={isTransitioning}
                      style={{ opacity: canScrollDown ? 1 : 0, transition: 'opacity 0.3s' }}
                      aria-label="Scroll down"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
