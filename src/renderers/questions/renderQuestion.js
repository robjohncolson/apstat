import { renderAttachments } from './renderAttachments.js';
import { isQuestionAnswered, getAttemptCount, canRetry } from '../utils/questionUtils.js';


function renderQuestion(question, index, classData, currentUsername) {
    const questionNumber = index + 1;
    const isAnswered = isQuestionAnswered(question.id, classData, currentUsername);
    const attempts = getAttemptCount(question.id, classData, currentUsername);
    const canRetryQuestion = canRetry(question.id, classData, currentUsername);
    
    let html = `
        <div class="quiz-container" data-question-id="${question.id}" data-question-number="${questionNumber}">
            <div class="question-header">
                <span>Question ${questionNumber}</span>
                ${isAnswered ? '<span style="color: #a5d6a7;">✓ Answered</span>' : ''}
            </div>
            <div class="question-id">ID: ${question.id || 'N/A'}</div>
            <div class="question-prompt">${question.prompt || 'No prompt provided'}</div>
    `;

    // Render attachments if present
    if (question.attachments) {
        html += renderAttachments(question.attachments, question.id);
    }

    // Handle MCQ
    if (question.type === 'multiple-choice') {
        const choices = question.choices || question.attachments?.choices || [];
        const savedAnswer = classData.users[currentUsername]?.answers?.[question.id];
        const isDisabled = isAnswered && !canRetryQuestion;
        
        html += '<div class="choices">';
        choices.forEach(choice => {
            const isSelected = savedAnswer?.value === choice.key || savedAnswer === choice.key;
            html += `
                <div class="choice ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}">
                    <label>
                        <input type="radio" 
                               name="choice-${question.id}" 
                               value="${choice.key}"
                               ${isSelected ? 'checked' : ''}
                               ${isDisabled ? 'disabled' : ''}>
                        <span class="choice-key">${choice.key}.</span>
                        <span>${choice.value}</span>
                    </label>
                </div>
            `;
        });
        html += '</div>';
    }

    // Handle FRQ
    if (question.type === 'free-response') {
        const savedAnswer = classData.users[currentUsername]?.answers?.[question.id];
        const isDisabled = isAnswered && !canRetryQuestion;
        html += `
            <div class="answer-section">
                <textarea
                    id="frq-${question.id}"
                    class="frq-textarea"
                    placeholder="Enter your complete response here..."
                    ${isDisabled ? 'disabled' : ''}
                    style="width: 100%; min-height: 200px; padding: 10px; border: 2px solid #ddd;"
                >${savedAnswer?.value || savedAnswer || ''}</textarea>
            </div>
        `;
    }

    // Add answer section
    html += `
        <div class="answer-section">
            <div class="reason-wrapper">
                <label class="reason-label">
                    ${attempts > 0 && !canRetryQuestion ? 
                        'Your explanation (required for retry):' : 
                        'Explain your reasoning (optional but enables retry):'}
                </label>
                <textarea 
                    id="reason-${question.id}"
                    class="reason-textarea ${attempts > 0 && canRetryQuestion ? 'required' : ''}"
                    placeholder="${attempts > 0 && !canRetryQuestion ? 
                        'Previous attempt did not include reasoning. Add reasoning to enable retry.' : 
                        'Explain why you chose this answer...'}"
                    ${!canRetryQuestion && attempts >= 3 ? 'disabled' : ''}
                >${classData.users[currentUsername]?.reasons?.[question.id] || ''}</textarea>
            </div>
            <div>
                <button 
                    id="submit-${question.id}"
                    class="submit-button" 
                    onclick="submitAnswer('${question.id}', '${question.type}')"
                    ${!canRetryQuestion && isAnswered ? 'disabled' : ''}
                >
                    ${isAnswered ? (canRetryQuestion ? 'Update Answer' : 'Max Attempts Reached') : 'Submit Answer'}
                </button>
                <span id="error-${question.id}" class="error-msg"></span>
                <span id="success-${question.id}" class="success-msg"></span>
            </div>
        </div>
    `;

    // Add dotplot section (always visible if answered)
    if (isAnswered) {
        html += `
            <div class="dotplot-section show" id="dotplot-section-${question.id}">
                <canvas id="dotplot-${question.id}" width="400" height="200"></canvas>
                <div id="consensus-${question.id}"></div>
                <div class="contributors-list" id="contributors-${question.id}"></div>
            </div>
        `;
    } else {
        html += `<div class="dotplot-section" id="dotplot-section-${question.id}"></div>`;
    }

    html += '</div>';
    return html;
}
export { renderQuestion };