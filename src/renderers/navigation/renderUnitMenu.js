/**
 * DO NOT MODIFY - GOLDEN CODE
 * Unit menu rendering function
 * Extracted from index.html lines 43025-43105
 */
import { isQuestionAnswered } from '../utils/questionUtils.js';

function renderUnitMenu(allCurriculumData, unitStructure, classData, currentUsername) {
        const questionsContainer = document.getElementById('questionsContainer');

    // Sort units numerically
    const sortedUnits = Object.keys(allCurriculumData).sort((a, b) => parseInt(a) - parseInt(b));

    console.log('Rendering units:', sortedUnits); // Debug log

    let unitsHtml = '';
    sortedUnits.forEach(unitNum => {
        const unitData = allCurriculumData[unitNum];
        const unitName = unitStructure[unitNum]?.name || `Unit ${unitNum}`;
        const lessonCount = unitData.unitInfo.lessonNumbers.length;
        const questionCount = unitData.questions.length;

        console.log(`Unit ${unitNum}: ${questionCount} questions, ${lessonCount} lessons`); // Debug log

        // Calculate completion percentage for this unit
        let completedQuestions = 0;
        unitData.questions.forEach(q => {
            if (isQuestionAnswered(q.id, classData, currentUsername)) completedQuestions++;
        });
        const completionPercent = questionCount > 0 ? Math.round((completedQuestions / questionCount) * 100) : 0;

        unitsHtml += `
            <div class="unit-card" onclick="selectUnit(${unitNum})">
                <div class="unit-header">
                    <h3>Unit ${unitNum}</h3>
                    <span class="completion-badge">${completionPercent}%</span>
                </div>
                <div class="unit-title">${unitName}</div>
                <div class="unit-stats">
                    <span>${lessonCount} lessons</span>
                    <span>•</span>
                    <span>${questionCount} questions</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${completionPercent}%"></div>
                </div>
            </div>
        `;
    });

    questionsContainer.innerHTML = `
        <div class="curriculum-overview">
            <h2>📚 AP Statistics Curriculum</h2>
            <p style="text-align: center; color: #666;">Loaded ${sortedUnits.length} units</p>
            <div class="units-grid">
                ${unitsHtml}
            </div>
            <div class="app-controls" style="margin-top: 20px;">
                <button id="syncBtn" class="control-btn">
                    <i class="fas fa-sync"></i>
                    Sync
                </button>
                <input type="file" id="importFile" accept=".json" style="display: none;">
            </div>

            <!-- Sync Modal -->
            <div id="syncModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Sync Options</h2>
                    <div class="sync-buttons">
                        <button id="exportBtn" class="modal-btn">
                            <i class="fas fa-download"></i>
                            Export
                        </button>
                        <button id="importBtn" class="modal-btn">
                            <i class="fas fa-upload"></i>
                            Import
                        </button>
                        <button id="totalExportBtn" class="modal-btn">
                            <i class="fas fa-database"></i>
                            Total Export
                        </button>
                    </div>
                </div>
            </div>

        </div>
    `;
}
export { renderUnitMenu };