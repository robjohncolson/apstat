/**
 * DO NOT MODIFY - GOLDEN CODE
 * Calculate badges for a user
 * Extracted from index.html lines 42335-42375
 */
function calculateBadges(username, classData) {
    const userAnswers = classData.users[username]?.answers || {};
    const userReasons = classData.users[username]?.reasons || {};
    const userAttempts = classData.users[username]?.attempts || {};

    const totalAnswers = Object.keys(userAnswers).length;
    if (totalAnswers === 0) return [];

    const badges = [];

    // Calculate outlier/conformist
    let modeMatches = 0;
    let outlierCount = 0;

    Object.keys(userAnswers).forEach(qId => {
        const allAnswers = Object.values(classData.users)
            .map(u => u.answers?.[qId]?.value || u.answers?.[qId])
            .filter(a => a);

        if (allAnswers.length > 1) {
            const mode = getMostFrequent(allAnswers);
            const userAnswer = userAnswers[qId]?.value || userAnswers[qId];
            if (userAnswer === mode) modeMatches++;
            else outlierCount++;
        }
    });

    if (outlierCount > totalAnswers * 0.5) badges.push('🎯 Outlier');
    if (modeMatches > totalAnswers * 0.8) badges.push('👥 Conformist');

    // Explorer badge
    const multiAttempts = Object.values(userAttempts).filter(a => a >= 2).length;
    if (multiAttempts > totalAnswers * 0.3) badges.push('🔄 Explorer');

    // Silent type vs Debater
    const reasonCount = Object.values(userReasons).filter(r => r && r.trim()).length;
    if (reasonCount < totalAnswers * 0.2) badges.push('🤐 Silent Type');
    else if (reasonCount > totalAnswers * 0.8) badges.push('💬 Debater');

    // Completionist
    const totalQuestions = currentQuestions.length;
    if (totalAnswers === totalQuestions && totalQuestions > 0) badges.push('✅ Completionist');

    return badges;
}

export { calculateBadges };