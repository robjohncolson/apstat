  /**
   * DO NOT MODIFY - GOLDEN CODE
   * MCQ distribution chart rendering function
   * Extracted from index.html lines 45718-45904
   */
  import { setChartInstance, destroyChartInstance } from '../utils/chartRegistry.js';
  import { getTextColor } from '../utils/themeUtils.js'; 
  import { calculateBadges } from '../utils/calculateBadges.js';

  function renderMCQDistribution(questionId, currentQuestions, classData, currentUsername) {
    const canvas = document.getElementById(`dotplot-${questionId}`);
    if (!canvas) return;

    // Fix canvas dimensions to prevent cropping
    const container = canvas.parentElement;
    container.style.height = '500px';  // Increased from 350px
    container.style.position = 'relative';
    container.style.overflow = 'visible';  // Changed from 'hidden' to 'visible'

    // Ensure the canvas itself has room
    canvas.style.height = '600px';  // Increased from 300px
    canvas.style.width = '100%';

    // Aggregate responses
    const choiceCounts = {};
    let totalCount = 0;
    const contributors = [];

    // Get the question to know all possible choices
    const question = currentQuestions.find(q => q.id === questionId);
    const allChoices = question?.choices || question?.attachments?.choices || [];

    // Initialize all choices with 0
    allChoices.forEach(choice => {
        choiceCounts[choice.key] = 0;
    });

    // Count actual responses
    for (let username in classData.users) {
        const userAnswer = classData.users[username].answers?.[questionId];
        if (userAnswer) {
            const choice = userAnswer.value || userAnswer;
            const reason = classData.users[username].reasons?.[questionId] || '';

            choiceCounts[choice] = (choiceCounts[choice] || 0) + 1;
            totalCount++;
            contributors.push({
                username: username,
                choice: choice,
                reason: reason
            });
        }
    }

    // Create bar chart (like your example JSON)
    const ctx = canvas.getContext('2d');
    const choices = Object.keys(choiceCounts).sort();
    const counts = choices.map(c => choiceCounts[c] || 0);
    const relativeFrequencies = counts.map(c => totalCount > 0 ? c / totalCount : 0);

    // Destroy existing chart if any
    destroyChartInstance(`dotplot-${questionId}`);

    // Create bar chart with relative frequencies
    setChartInstance(`dotplot-${questionId}`, new Chart(ctx, {
                type: 'bar',
        data: {
            labels: choices,
            datasets: [{
                label: 'Relative Frequency',
                data: relativeFrequencies,
                backgroundColor: choices.map(c => {
                    // Highlight user's choice in different color
                    const userChoice = classData.users[currentUsername]?.answers?.[questionId];
                    const userChoiceValue = userChoice?.value || userChoice;
                    return c === userChoiceValue ? '#4CAF50' : '#36A2EB';
                }),
                borderColor: '#2196F3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    bottom: 20
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        stepSize: 0.1,
                        callback: function(value) {
                            return (value * 100).toFixed(0) + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Relative Frequency'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Answer Choice'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const percentage = (value * 100).toFixed(1);
                            const count = counts[context.dataIndex];
                            return `${percentage}% (${count} of ${totalCount} responses)`;
                        }
                    }
                }
            }
        }
    }));

    // Add consensus coloring
    const maxFreq = Math.max(...relativeFrequencies);
    const consensusDiv = document.getElementById(`consensus-${questionId}`);
    if (maxFreq >= 0.7) {
        consensusDiv.style.backgroundColor = '#e8f5e9';
        consensusDiv.style.border = '2px solid #4CAF50';
    } else if (maxFreq >= 0.6) {
        consensusDiv.style.backgroundColor = '#fff3e0';
        consensusDiv.style.border = '2px solid #ff9800';
    } else {
        consensusDiv.style.backgroundColor = '#ffebee';
        consensusDiv.style.border = '2px solid #f44336';
    }

    // Show consensus message
    if (consensusDiv) {
        if (totalCount > 1) {
            const modeIndex = relativeFrequencies.indexOf(maxFreq);
            const mode = choices[modeIndex];
            const percentage = (maxFreq * 100).toFixed(0);

            // Check for consensus (70% or more agreement)
            if (maxFreq >= 0.7) {
                consensusDiv.innerHTML = `
                    <div class="consensus-msg consensus">
                        ✓ Consensus reached on choice ${mode} (${percentage}% agreement)
                    </div>
                `;
            } else {
                consensusDiv.innerHTML = `
                    <div class="consensus-msg no-consensus">
                        No consensus yet - highest agreement: ${mode} at ${percentage}%
                    </div>
                `;
            }
        } else {
            consensusDiv.innerHTML = `
                <div class="consensus-msg no-consensus">
                    You're the first to answer! Import class data to see peer responses.
                </div>
            `;
        }
    }

    // Show contributors with their choices and reasons
    const contributorsDiv = document.getElementById(`contributors-${questionId}`);
    if (contributorsDiv && contributors.length > 0) {
        let html = '<h4 style="margin-top: 10px;">Individual Responses:</h4>';
        contributors.forEach(c => {
            const isCurrentUser = c.username === currentUsername;
            const badges = calculateBadges(c.username, classData);
            const badgeText = badges.length > 0 ? ` ${badges.join(' ')}` : '';

            // CRITICAL: Always show the reason if it exists
            html += `
                <div class="contributor-item" style="${isCurrentUser ? 'background: #e3f2fd;' : ''}">
                    <span class="contributor-choice">${c.username}${badgeText} → Choice ${c.choice}</span>
                    ${c.reason ? `<div class="contributor-reason" style="margin-top: 5px; padding: 8px; background: #f9f9f9; border-left: 3px solid #2196F3; font-style: italic;">"${c.reason}"</div>` : '<div style="color: #999; font-style: italic; margin-top: 5px;">No explanation provided</div>'}
                </div>
            `;
        });
        contributorsDiv.innerHTML = html;
    }
}



  export { renderMCQDistribution };