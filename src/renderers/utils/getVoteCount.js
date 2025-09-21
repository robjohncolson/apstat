/**
 * DO NOT MODIFY - GOLDEN CODE
 * Get vote count for a user
 * Extracted from index.html lines 45944-45975
 */
function getVoteCount(questionId, targetUser, voteType, classData) {
    let count = 0;
    for (let username in classData.users) {
        const userVotes = classData.users[username].votes?.[questionId]?.[targetUser];
        if (userVotes?.type === voteType) {
            count++;
        }
    }
    return count;
}

export { getVoteCount };