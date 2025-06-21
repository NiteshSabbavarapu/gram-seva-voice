import React, { useState } from "react";
import { supabase } from "../integrations/supabase/client";

interface FeedbackFormProps {
  complaintId: string;
  supervisorId: string;
  onSubmitted?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  complaintId,
  supervisorId,
  onSubmitted,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const feedbackData = {
      complaint_id: complaintId,
      supervisor_id: supervisorId,
      rating,
      comments,
    };
    console.log('Submitting feedback:', feedbackData);

    const { error } = await supabase
      .from("supervisor_feedback")
      .insert([feedbackData]);

    setLoading(false);

    if (error) {
      console.error('Feedback submission error:', error);
      setError(error.message + (error.details ? ` (${error.details})` : ''));
    } else {
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto flex flex-col items-center gap-4 border border-gray-200 text-green-700 text-lg font-semibold">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto flex flex-col gap-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-ts-text mb-2">Rate your experience with the supervisor</h3>
      <div className="flex items-center gap-2 mb-2">
        <label className="font-medium text-ts-text mr-2">Rating:</label>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            className={`text-2xl focus:outline-none transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1 mb-2">
        <label className="font-medium text-ts-text">Comments:</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-ts-primary focus:outline-none resize-y min-h-[60px]"
          placeholder="Write your feedback..."
        />
      </div>
      {error && <div className="text-red-600 text-sm font-medium mb-2">{error}</div>}
      <button
        type="submit"
        disabled={loading || rating === 0}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${loading || rating === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-ts-primary text-white hover:bg-ts-primary-dark'}`}
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
};

export default FeedbackForm; 