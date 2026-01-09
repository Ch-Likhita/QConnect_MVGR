import React, { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { Answer } from '../../types/answer';
import { likeAnswer } from '../../services/answers.services';

interface AnswerCardProps {
  answer: Answer;
  questionId: string;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ answer, questionId }) => {
  const [isLiking, setIsLiking] = useState(false);
  const [count, setCount] = useState(answer.likeCount || 0);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    // Optimistic update: increase count immediately in UI
    setCount(prev => prev + 1);
    try {
      await likeAnswer(questionId, answer.id!);
    } catch (error) {
      // Rollback if the database update fails
      setCount(prev => prev - 1);
      console.error('Failed to like answer:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <p className="text-gray-800">{answer.body}</p>
      <div className="flex items-center mt-2">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
        >
          <ThumbsUp size={16} />
          <span>{count} Likes</span>
        </button>
      </div>
    </div>
  );
};

export default AnswerCard;
