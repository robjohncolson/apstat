/**
 * DO NOT MODIFY - GOLDEN CODE
 * Render FRQ responses
 * Extracted from index.html lines 45975-46014
 *
 */
import { getVoteCount } from '../utils/getVoteCount.js';

function renderFRQResponses(questionId, classData, currentUsername) {
    const canvas = document.getElementById(`dotplot-${questionId}`);
    const consensusDiv = document.getElementById(`consensus-${questionId}`);
    const contributorsDiv = document.getElementById(`contributors-${questionId}`);
    
    if (canvas) canvas.style.display = 'none';
    
    const responses = [];
    for (let username in classData.users) {
        const userAnswer = classData.users[username].answers?.[questionId];
        if (userAnswer) {
            const response = userAnswer.value || userAnswer;
            const reason = classData.users[username].reasons?.[questionId] || '';
            responses.push({
                username: username,
                response: response,
                reason: reason
            });
        }
    }
    
    if (consensusDiv) {
        if (responses.length > 1) {
            consensusDiv.innerHTML = `
                <div class="consensus-msg no-consensus">
                    ${responses.length} responses submitted. Review peer responses below.
                </div>
            `;
        } else {
            consensusDiv.innerHTML = `
                <div class="consensus-msg no-consensus">
                    Your response recorded. Import class data to see peer responses.
                </div>
            `;
        }
    }
    
    if (contributorsDiv) {
        let html = '<h4>Responses:</h4>';
        responses.forEach(r => {
            const userVotes = classData.users[currentUsername]?.votes?.[questionId]?.[r.username] || {};
            html += `
                <div class="contributor-item">
                    <strong>${r.username}:</strong>
                    <div style="margin-top: 5px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                        ${r.response}
                    </div>
                    ${r.reason ? `<div class="contributor-reason">${r.reason}</div>` : ''}
                    <div style="margin-top: 10px;">
                        <button onclick="voteFRQ('${questionId}', '${r.username}', 'helpful')"
                                class="vote-btn ${userVotes.type === 'helpful' ? 'active' : ''}">
                            💡 Helpful (${getVoteCount(questionId, r.username, 'helpful', classData)})
                        </button>
                        <button onclick="voteFRQ('${questionId}', '${r.username}', 'unclear')"
                                class="vote-btn ${userVotes.type === 'unclear' ? 'active' : ''}">
                            🤔 Unclear (${getVoteCount(questionId, r.username, 'unclear', classData)})
                        </button>
                        <button onclick="voteFRQ('${questionId}', '${r.username}', 'contradicts')"
                                class="vote-btn ${userVotes.type === 'contradicts' ? 'active' : ''}">
                            ⚔️ Contradicts (${getVoteCount(questionId, r.username, 'contradicts', classData)})
                        </button>
                    </div>
                </div>
            `;
        });
        contributorsDiv.innerHTML = html;
    }
}

export { renderFRQResponses };