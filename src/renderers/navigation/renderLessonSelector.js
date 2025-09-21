
  /**
   * DO NOT MODIFY - GOLDEN CODE
   * Lesson selector rendering function
   * Extracted from index.html lines 43025-43105
   */
  import { isQuestionAnswered } from '../utils/questionUtils.js';

  function renderLessonSelector(unitInfo, classData, currentUsername) {
    const questionsContainer = document.getElementById('questionsContainer');
    
    // If unitInfo provided (from file load), use it
    if (unitInfo && unitInfo.lessonNumbers) {
        let lessonButtonsHtml = '';
        
        unitInfo.lessonNumbers.forEach(lessonNum => {
            const questions = unitInfo.lessons[lessonNum];
            const isCompleted = questions.every(q => isQuestionAnswered(q.id, classData, currentUsername));
            const displayName = lessonNum === 'PC' ? 'Progress Check' : `Lesson ${lessonNum}`;
            const buttonId = lessonNum === 'PC' ? 'lesson-btn-PC' : `lesson-btn-${lessonNum}`;

            lessonButtonsHtml += `
                <button onclick="loadLesson('${lessonNum}')"
                        class="lesson-btn ${isCompleted ? 'completed' : ''}"
                        id="${buttonId}">
                    ${displayName}<br>
                    <small>${questions.length} questions</small>
                </button>
            `;
        });
        
        questionsContainer.innerHTML = `
            <button onclick="backToUnits()" class="back-button">← Back to Units</button>
            <div class="lesson-selector">
                <h3>Unit ${currentUnit}: ${unitStructure[currentUnit]?.name || 'Unknown Unit'}</h3>
                <p>Select a lesson to begin:</p>
                <div class="lesson-buttons">
                    ${lessonButtonsHtml}
                </div>
            </div>
        <div class="app-controls">
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
        `;
        return;
    }
    
    // Old fallback code for when called without unitInfo
    const unit = unitStructure[currentUnit];
    if (!unit) return;
    
    let lessonButtonsHtml = '';
    
    // Group questions by lesson
    const lessonGroups = {};
    allUnitQuestions.forEach(q => {
        const match = q.id.match(/L(\d+)/);
        if (match) {
            const lessonNum = parseInt(match[1]);
            if (!lessonGroups[lessonNum]) {
                lessonGroups[lessonNum] = [];
            }
            lessonGroups[lessonNum].push(q);
        }
    });
    
    for (let i = 1; i <= unit.lessons; i++) {
        const questionCount = lessonGroups[i] ? lessonGroups[i].length : 0;
        const isCompleted = checkLessonCompleted(currentUnit, i);
        lessonButtonsHtml += `
            <button onclick="loadLesson(${i})" class="lesson-btn ${isCompleted ? 'completed' : ''}" id="lesson-btn-${i}">
                Lesson ${i}<br>
                <small>${questionCount} questions</small>
            </button>
        `;
    }
    
    questionsContainer.innerHTML = `
        <button onclick="backToUnits()" class="back-button">← Back to Units</button>
        <div class="lesson-selector">
            <h3>Unit ${currentUnit}: ${unit.name}</h3>
            <p>Select a lesson to begin:</p>
            <div class="lesson-buttons">
                ${lessonButtonsHtml}
            </div>
        </div>
        <div class="app-controls">
            <button id="syncBtn" class="control-btn">
                <i class="fas fa-sync"></i>
                Sync
            </button>
            <input type="file" id="importFile" accept=".json" style="display: none;">
        </div>

        <!-- Enhanced Sync Modal with Cloud Integration -->
        <div id="syncModal" class="modal" style="display: none;">
            <div class="modal-content enhanced-sync-modal">
                <span class="close-modal">&times;</span>
                <h2><i class="fas fa-sync"></i> Sync & Backup Options</h2>

                <!-- Tab Navigation -->
                <div class="sync-tabs">
                    <button class="sync-tab active" data-tab="local">
                        <i class="fas fa-hdd"></i> Local Sync
                    </button>
                    <button class="sync-tab" data-tab="cloud">
                        <i class="fas fa-cloud"></i> Cloud Sync
                    </button>
                </div>

                <!-- Local Sync Tab -->
                <div class="sync-tab-content active" id="localSyncTab">
                    <div class="sync-section-header">
                        <h3>Local File Operations</h3>
                        <p>Export and import quiz data using JSON files</p>
                    </div>

                    <div class="sync-buttons">
                        <button id="exportBtn" class="modal-btn">
                            <i class="fas fa-download"></i>
                            <span>
                                <strong>Export My Data</strong>
                                <small>Save your personal quiz data</small>
                            </span>
                        </button>
                        <button id="importBtn" class="modal-btn">
                            <i class="fas fa-upload"></i>
                            <span>
                                <strong>Import Data</strong>
                                <small>Load quiz data from file</small>
                            </span>
                        </button>
                        <button id="totalExportBtn" class="modal-btn">
                            <i class="fas fa-database"></i>
                            <span>
                                <strong>Total Export</strong>
                                <small>Export all users' data (master)</small>
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Cloud Sync Tab -->
                <div class="sync-tab-content" id="cloudSyncTab">
                    <div class="sync-section-header">
                        <h3>Cloud Synchronization</h3>
                        <p>Sync your data across devices instantly</p>
                    </div>

                    <!-- Cloud Sync Status -->
                    <div class="cloud-sync-status">
                        <div class="sync-status-row">
                            <span class="status-label">Last Sync:</span>
                            <span class="status-value" id="lastSyncTime">Never</span>
                        </div>
                        <div class="sync-status-row">
                            <span class="status-label">Auto-Sync:</span>
                            <span class="status-value">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="autoSyncToggle">
                                    <span class="toggle-slider"></span>
                                </label>
                                <span id="autoSyncStatus">OFF</span>
                            </span>
                        </div>
                    </div>

                    <!-- Cloud Sync Actions -->
                    <div class="sync-buttons cloud-buttons">
                        <button id="pushToCloudBtn" class="modal-btn cloud-btn">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>
                                <strong>Push to Cloud</strong>
                                <small>Upload local changes</small>
                            </span>
                        </button>
                        <button id="pullFromCloudBtn" class="modal-btn cloud-btn">
                            <i class="fas fa-cloud-download-alt"></i>
                            <span>
                                <strong>Pull from Cloud</strong>
                                <small>Download latest data</small>
                            </span>
                        </button>
                        <button id="syncBothWaysBtn" class="modal-btn cloud-btn primary">
                            <i class="fas fa-sync-alt"></i>
                            <span>
                                <strong>Two-Way Sync</strong>
                                <small>Merge local and cloud data</small>
                            </span>
                        </button>
                    </div>

                    <!-- Cloud Sync Stats -->
                    <div class="cloud-sync-stats">
                        <div class="stat-item">
                            <i class="fas fa-desktop"></i>
                            <div>
                                <strong id="localRecordCount">0</strong>
                                <small>Local Records</small>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-cloud"></i>
                            <div>
                                <strong id="cloudRecordCount">0</strong>
                                <small>Cloud Records</small>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <div>
                                <strong id="totalUserCount">0</strong>
                                <small>Total Users</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export { renderLessonSelector };