'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { ReviewForm } from './review-form';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';

interface ReviewListProps {
  status?: 'pending' | 'approved' | 'rejected';
  onEdit: (review: any) => void;
}

export function ReviewList({ status = '', onEdit }: ReviewListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const url = status ? `/api/reviews?status=${status}` : '/api/reviews';
      const data = await apiRequest(url);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [status]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiRequest(`/api/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Review ${newStatus} successfully`);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await apiRequest(`/api/reviews/${id}`, { method: 'DELETE' });
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell className="font-medium">
                {review.user?.name || 'Guest'}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {review.comment || 'No comment'}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={
                    review.status === 'approved' ? 'default' : 
                    review.status === 'rejected' ? 'destructive' : 'secondary'
                  }
                >
                  {review.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(review.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setSelectedReview(review);
                    onEdit(review);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {review.status !== 'approved' && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleStatusChange(review.id, 'approved')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                {review.status !== 'rejected' && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleStatusChange(review.id, 'rejected')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(review.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showForm && (
        <ReviewForm
          review={selectedReview}
          onClose={() => {
            setShowForm(false);
            setSelectedReview(null);
          }}
          onSuccess={() => {
            fetchReviews();
            setShowForm(false);
            setSelectedReview(null);
          }}
        />
      )}
    </div>
  );
}
