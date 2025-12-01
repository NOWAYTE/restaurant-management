'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ReviewList } from './_components/review-list';
import { ReviewStats } from './_components/review-stats';

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const handleEditReview = (review: any) => {
    setSelectedReview(review);
    setShowReviewForm(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reviews</h1>
        <Button onClick={() => {
          setSelectedReview(null);
          setShowReviewForm(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Review
        </Button>
      </div>

      <div className="grid gap-6">
        <ReviewStats />
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <ReviewList status="" onEdit={handleEditReview} />
              </TabsContent>
              <TabsContent value="pending">
                <ReviewList status="pending" onEdit={handleEditReview} />
              </TabsContent>
              <TabsContent value="approved">
                <ReviewList status="approved" onEdit={handleEditReview} />
              </TabsContent>
              <TabsContent value="rejected">
                <ReviewList status="rejected" onEdit={handleEditReview} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
