'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/api';

const formSchema = z.object({
  user_id: z.number().min(1, 'User is required'),
  order_id: z.number().optional(),
  rating: z.number().min(1, 'Rating is required').max(5, 'Maximum rating is 5'),
  comment: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  admin_comment: z.string().optional(),
});

interface ReviewFormProps {
  review?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewForm({ review, onClose, onSuccess }: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: review?.user_id || '',
      order_id: review?.order_id || undefined,
      rating: review?.rating || 5,
      comment: review?.comment || '',
      status: review?.status || 'pending',
      admin_comment: review?.admin_comment || '',
    },
  });

  useEffect(() => {
    // Fetch users and orders for the form
    const fetchData = async () => {
      try {
        // In a real app, you would fetch these from your API
        // const [usersData, ordersData] = await Promise.all([
        //   apiRequest('/api/users'),
        //   apiRequest('/api/orders')
        // ]);
        // setUsers(usersData);
        // setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      if (review) {
        // Update existing review
        await apiRequest(`/api/reviews/${review.id}`, {
          method: 'PATCH',
          body: JSON.stringify(values),
        });
        toast({
          title: 'Success',
          description: 'Review updated successfully',
        });
      } else {
        // Create new review
        await apiRequest('/api/reviews', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        toast({
          title: 'Success',
          description: 'Review created successfully',
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        title: 'Error',
        description: 'Failed to save review',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{review ? 'Edit Review' : 'Add New Review'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an order (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id.toString()}>
                            Order #{order.id} - {order.customer_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {Array(num).fill('★').join('')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admin_comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Notes (Internal)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Internal notes about this review..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Review'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
