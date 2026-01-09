import React from 'react';
import { AlumniAnswer } from '../services/alumni.service';
import Link from 'next/link';

interface AnswerCardProps {
  alumniAnswer: AlumniAnswer;
}

export default function AnswerCard({ alumniAnswer }: AnswerCardProps) {
  const { answer, question } = alumniAnswer;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <Link href={`/questions/${question.id}`} className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 mb-2 block">
        {question.title}
      </Link>
      <p className="text-gray-700 mb-4">{answer.body}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{answer.likeCount} likes</span>
        {answer.isAccepted && <span className="text-green-600 font-semibold">Accepted Answer</span>}
      </div>
    </div>
  );
}
