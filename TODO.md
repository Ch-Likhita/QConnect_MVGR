# TODO List for Updating Like Answer Functionality

- [x] Update AnswerCard.tsx: Add useState for count initialized with answer.likeCount || 0, implement optimistic update in handleLike (increment immediately, rollback on error), change display to {count} Likes.
- [x] Deploy functions: Run firebase deploy --only functions.
- [x] Update QuestionPage: Import AnswerCard, replace answers.map with AnswerCard components, remove handleLike function.
