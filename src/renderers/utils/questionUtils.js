/**
 * DO NOT MODIFY - GOLDEN CODE
 * Question utility functions
 * Extracted from index.html lines 42375-42421
 */
function isQuestionAnswered(questionId, classData, currentUsername) {
    return classData.users[currentUsername]?.answers?.[questionId] !== undefined;
}

// Get attempt count for a question
function getAttemptCount(questionId, classData, currentUsername) {
    return classData.users[currentUsername]?.attempts?.[questionId] || 0;
}

// Check if can retry (has reason in previous attempt and < 3 attempts)
function canRetry(questionId, classData, currentUsername) {
    const attempts = getAttemptCount(questionId, classData, currentUsername);
    if (attempts >= 3) return false;
    if (attempts === 0) return true;
    
    // Check if previous attempt had a reason
    const previousReason = classData.users[currentUsername]?.reasons?.[questionId];
    return previousReason && previousReason.trim().length > 0;
}

export { isQuestionAnswered, getAttemptCount, canRetry };