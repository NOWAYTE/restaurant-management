'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, X, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Review = {
  id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchReviews();
    }
  }, [status, router]);

  const fetchReviews = async () => {
    if (!session?.user) {
      setError('You must be logged in to view reviews');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized - Please log in again');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      setUpdating(id);
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        fetchReviews(); // Refresh the list
      } else {
        throw new Error('Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setError('Failed to update review. Please try again.');
      toast.error('Failed to update review');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Reviews</h1>
      
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p>No reviews found.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-medium">{review.user_name || 'Anonymous'}</p>
                  <p className="text-gray-700 mt-1">{review.comment}</p>
                </div>
                
                {review.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateReviewStatus(review.id, 'approved')}
                      disabled={updating === review.id}
                    >
                      {updating === review.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateReviewStatus(review.id, 'rejected')}
                      disabled={updating === review.id}
                    >
                      {updating === review.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
              
              {review.status !== 'pending' && (
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      review.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {review.status}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}