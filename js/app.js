
  // js/app.js
  // Main application controller.
  // NO ES6 modules - Global namespace pattern
  (function(window) {
    'use strict';

    function App() {
        this.fileManager = new window.FileManager();
        this.uiRenderer = null;
        this.curriculum = window.EMBEDDED_CURRICULUM || [];
        console.log("App constructed.");
    }

    App.prototype.init = function() {
        console.log("App.init() called.");
        this.setupEventListeners();
        this.updateUI();
        this.renderUnitMenu();
        console.log("Curriculum loaded with", this.curriculum.length, "questions.");
    };

    App.prototype.setupEventListeners = function() {
        var self = this;

        document.getElementById('new-file-btn').addEventListener('click', function() { self.handleNewFile(); });
        document.getElementById('load-file-btn').addEventListener('click', function() { self.handleLoadFile(); });
        document.getElementById('save-file-btn').addEventListener('click', function() { self.handleSaveFile(); });
        document.getElementById('load-peer-btn').addEventListener('click', function() { self.handleLoadPeerData(); });

        var fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (file) {
                self.fileManager.loadFile(file).then(function() {
                    console.log("File loading process completed in App.");
                    self.renderUnitMenu();
                }).catch(function(err){
                    console.error("File loading failed in App.", err);
                });
            }
        });

        var peerFileInput = document.getElementById('peer-file-input');
        peerFileInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (file) {
                self.loadPeerDataFile(file);
            }
        });

        window.addEventListener('filestatuschange', function(e) {
            self.updateUI(e.detail);
        });
    };

    App.prototype.handleNewFile = function() {
        var username = prompt("Please enter your username (e.g., Apple_Rabbit):");
        if (username) {
            this.fileManager.createNewFile(username);
            this.renderUnitMenu();
        }
    };

    App.prototype.handleLoadFile = function() {
        document.getElementById('file-input').click();
    };

    App.prototype.handleSaveFile = function() {
        this.fileManager.saveFile();
    };

    App.prototype.handleLoadPeerData = function() {
        if (!this.fileManager.currentData) {
            alert("Please load a student file first before importing peer data.");
            return;
        }
        document.getElementById('peer-file-input').click();
    };

    App.prototype.loadPeerDataFile = function(file) {
        var self = this;
        var reader = new FileReader();

        reader.onload = function(e) {
            try {
                var masterData = JSON.parse(e.target.result);
                var success = self.fileManager.importPeerData(masterData);

                if (success) {
                    alert("Peer data loaded successfully!");
                    console.log("Peer data import completed.");

                    // Re-render current view to show peer data
                    var questionContainer = document.getElementById('question-container');
                    if (questionContainer.style.display !== 'none') {
                        // Currently viewing questions - force complete re-render
                        var currentHeader = questionContainer.querySelector('h2');
                        if (currentHeader) {
                            var headerText = currentHeader.textContent;
                            console.log("Re-rendering questions after peer data load:", headerText);

                            // Extract unit and lesson from header like "Unit 1 - Lesson 2"
                            var matches = headerText.match(/Unit (\d+) - Lesson (\d+)/);
                            if (matches) {
                                var unitId = matches[1];
                                var lessonId = matches[2];
                                self.selectLesson(unitId, lessonId);
                            }
                        }
                    }
                } else {
                    alert("Failed to import peer data. Please check the file format.");
                }
            } catch (error) {
                console.error("Error parsing peer data file:", error);
                alert("Failed to read the peer data file. Please ensure it's a valid JSON file.");
            }
        };

        reader.onerror = function() {
            console.error("FileReader error while loading peer data.");
            alert("An error occurred while reading the peer data file.");
        };

        reader.readAsText(file);
    };

    App.prototype.updateUI = function(status) {
        status = status || { isDirty: false, username: null };

        var saveButton = document.getElementById('save-file-btn');
        var saveIndicator = document.getElementById('save-indicator');

        if (!this.fileManager.currentData) {
            saveButton.disabled = true;
            saveIndicator.textContent = "No File Loaded";
            saveIndicator.classList.remove('dirty');
        } else {
            saveButton.disabled = false;
            saveIndicator.textContent = 'File: ' + (status.username || this.fileManager.currentUsername);
            if (status.isDirty) {
                saveIndicator.classList.add('dirty');
                saveIndicator.textContent += " (unsaved)";
            } else {
                saveIndicator.classList.remove('dirty');
                saveIndicator.textContent += " (saved)";
            }
        }

        console.log("UI updated.");
    };

    App.prototype.renderUnitMenu = function() {
        var self = this;
        var unitMenuContainer = document.getElementById('unit-menu');
        var organizedCurriculum = this.fileManager.getOrganizedCurriculum();

        var sortedUnitKeys = Object.keys(organizedCurriculum).sort(function(a, b) {
            return parseInt(a) - parseInt(b);
        });

        var unitsHtml = '';
        sortedUnitKeys.forEach(function(unitNum) {
            var unitData = organizedCurriculum[unitNum];
            var progress = self.fileManager.calculateUnitProgress(unitData);
            var unitName = unitData.unitInfo.displayName || unitData.unitInfo.name;
            var lessonCount = unitData.unitInfo.lessonNumbers.length;
            var questionCount = unitData.questions.length;

            unitsHtml +=
                '<div class="unit-card" data-unit-id="' + unitNum + '">' +
                    '<div class="unit-header">' +
                        '<h3>Unit ' + unitNum + '</h3>' +
                        '<span class="completion-badge">' + progress.percent + '%</span>' +
                    '</div>' +
                    '<div class="unit-title">' + unitName + '</div>' +
                    '<div class="unit-stats">' +
                        '<span>' + lessonCount + ' lessons</span>' +
                        '<span>•</span>' +
                        '<span>' + questionCount + ' questions</span>' +
                    '</div>' +
                    '<div class="progress-bar">' +
                        '<div class="progress-fill" style="width: ' + progress.percent + '%"></div>' +
                    '</div>' +
                '</div>';
        });

        unitMenuContainer.innerHTML =
            '<div class="curriculum-overview">' +
                '<h2>📚 AP Statistics Curriculum</h2>' +
                '<div class="units-grid">' + unitsHtml + '</div>' +
            '</div>';

        unitMenuContainer.querySelectorAll('.unit-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var unitId = this.getAttribute('data-unit-id');
                self.selectUnit(unitId);
            });
        });

        console.log("Unit menu rendered with", sortedUnitKeys.length, "units.");
    };

    App.prototype.selectUnit = function(unitId) {
        var self = this;
        console.log("Unit selected:", unitId);

        // Hide unit menu and show lesson selector
        document.getElementById('unit-menu').style.display = 'none';
        document.getElementById('lesson-selector').style.display = 'block';

        // Render the lesson selector for this unit
        this.renderLessonSelector(unitId);
    };

    App.prototype.renderLessonSelector = function(unitId) {
        var self = this;
        var lessonSelectorContainer = document.getElementById('lesson-selector');
        var organizedCurriculum = this.fileManager.getOrganizedCurriculum();
        var unitData = organizedCurriculum[unitId];

        if (!unitData) {
            console.error("Unit data not found for unit:", unitId);
            return;
        }

        var unitName = unitData.unitInfo.displayName || unitData.unitInfo.name;
        var lessons = unitData.unitInfo.lessonNumbers;

        // Group questions by lesson
        var lessonQuestions = {};
        unitData.questions.forEach(function(question) {
            var idParts = question.id.split('-');
            if (idParts.length >= 2) {
                var lessonNum = idParts[1].replace('L', '');
                if (!lessonQuestions[lessonNum]) {
                    lessonQuestions[lessonNum] = [];
                }
                lessonQuestions[lessonNum].push(question);
            }
        });

        // Build lesson buttons HTML
        var lessonsHtml = '';
        lessons.forEach(function(lessonNum) {
            var questionCount = lessonQuestions[lessonNum] ? lessonQuestions[lessonNum].length : 0;
            var completed = 0;

            // Calculate completion for this lesson
            if (self.fileManager.currentData && self.fileManager.currentData.personalData.answers) {
                var answers = self.fileManager.currentData.personalData.answers;
                if (lessonQuestions[lessonNum]) {
                    lessonQuestions[lessonNum].forEach(function(q) {
                        if (answers[q.id] !== undefined) {
                            completed++;
                        }
                    });
                }
            }

            var percent = questionCount > 0 ? Math.round((completed / questionCount) * 100) : 0;

            lessonsHtml +=
                '<div class="lesson-card" data-unit-id="' + unitId + '" data-lesson-id="' + lessonNum + '">' +
                    '<div class="lesson-header">' +
                        '<h4>Lesson ' + lessonNum + '</h4>' +
                        '<span class="completion-badge">' + percent + '%</span>' +
                    '</div>' +
                    '<div class="lesson-stats">' +
                        '<span>' + questionCount + ' questions</span>' +
                        '<span>•</span>' +
                        '<span>' + completed + ' completed</span>' +
                    '</div>' +
                    '<div class="progress-bar">' +
                        '<div class="progress-fill" style="width: ' + percent + '%"></div>' +
                    '</div>' +
                '</div>';
        });

        lessonSelectorContainer.innerHTML =
            '<div class="lesson-overview">' +
                '<div class="lesson-header-section">' +
                    '<button id="back-to-units-btn" class="back-button">← Back to Units</button>' +
                    '<h2>' + unitName + '</h2>' +
                '</div>' +
                '<div class="lessons-grid">' + lessonsHtml + '</div>' +
            '</div>';

        // Add event listeners
        document.getElementById('back-to-units-btn').addEventListener('click', function() {
            self.showUnitMenu();
        });

        lessonSelectorContainer.querySelectorAll('.lesson-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var unitId = this.getAttribute('data-unit-id');
                var lessonId = this.getAttribute('data-lesson-id');
                self.selectLesson(unitId, lessonId);
            });
        });

        console.log("Lesson selector rendered for Unit", unitId, "with", lessons.length, "lessons.");
    };

    App.prototype.selectLesson = function(unitId, lessonId) {
        var self = this;
        console.log("Lesson selected: Unit", unitId, "Lesson", lessonId);

        // Hide lesson selector and show question container
        document.getElementById('lesson-selector').style.display = 'none';
        document.getElementById('question-container').style.display = 'block';

        // Get questions for this lesson
        var organizedCurriculum = this.fileManager.getOrganizedCurriculum();
        var unitData = organizedCurriculum[unitId];

        if (!unitData) {
            console.error("Unit data not found for unit:", unitId);
            return;
        }

        var lessonQuestions = [];
        unitData.questions.forEach(function(question) {
            var idParts = question.id.split('-');
            if (idParts.length >= 2) {
                var qLessonNum = idParts[1].replace('L', '');
                if (qLessonNum === lessonId) {
                    lessonQuestions.push(question);
                }
            }
        });

        // Sort questions by question number
        lessonQuestions.sort(function(a, b) {
            var aNum = parseInt(a.id.split('-')[2].replace('Q', ''));
            var bNum = parseInt(b.id.split('-')[2].replace('Q', ''));
            return aNum - bNum;
        });

        this.renderQuestionsForLesson(unitId, lessonId, lessonQuestions);
    };

    App.prototype.renderQuestionsForLesson = function(unitId, lessonId, questions) {
        var self = this;
        var questionContainer = document.getElementById('question-container');
        var organizedCurriculum = this.fileManager.getOrganizedCurriculum();
        var unitName = organizedCurriculum[unitId].unitInfo.displayName || organizedCurriculum[unitId].unitInfo.name;

        var questionsHtml = '';
        questions.forEach(function(question) {
            questionsHtml += self.renderQuestion(question);
        });

        questionContainer.innerHTML =
            '<div class="question-overview">' +
                '<div class="question-header-section">' +
                    '<button id="back-to-lessons-btn" class="back-button">← Back to Lessons</button>' +
                    '<h2>' + unitName + ' - Lesson ' + lessonId + '</h2>' +
                '</div>' +
                '<div class="questions-list">' + questionsHtml + '</div>' +
            '</div>';

        // Add event listener for back button
        document.getElementById('back-to-lessons-btn').addEventListener('click', function() {
            self.showLessonSelector(unitId);
        });

        // Add event listeners for answer choices
        this.setupAnswerChoiceListeners();

        // Render any charts that might be present
        this.renderCharts();

        console.log("Questions rendered for Unit", unitId, "Lesson", lessonId, ":", questions.length, "questions.");
    };

    App.prototype.renderQuestion = function(question) {
        var self = this;
        var currentAnswer = '';

        // Get current answer if available
        if (this.fileManager.currentData && this.fileManager.currentData.personalData.answers) {
            var answer = this.fileManager.currentData.personalData.answers[question.id];
            if (answer && answer.value) {
                currentAnswer = answer.value;
            }
        }

        var questionHtml = '<div class="question-item" data-question-id="' + question.id + '">';

        // Question header
        questionHtml += '<div class="question-header">';
        questionHtml += '<h3>' + question.id + '</h3>';
        if (currentAnswer) {
            questionHtml += '<span class="answer-indicator">Answered: ' + currentAnswer + '</span>';
        }
        questionHtml += '</div>';

        // Question prompt
        questionHtml += '<div class="question-prompt">' + question.prompt + '</div>';

        // Handle attachments (tables, charts, etc.)
        if (question.attachments) {
            if (question.attachments.table) {
                questionHtml += this.renderTable(question.attachments.table);
            }
            // Check for chart data (chartType indicates a chart is present)
            if (question.attachments.chartType || question.attachments.charts) {
                questionHtml += '<div class="chart-container" id="chart-container-' + question.id + '" data-chart-id="' + question.id + '_chart"></div>';
            }
        }

        // Render answer choices for multiple choice questions
        if (question.type === 'multiple-choice' && question.attachments && question.attachments.choices) {
            questionHtml += '<div class="answer-choices">';
            question.attachments.choices.forEach(function(choice) {
                var isSelected = choice.key === currentAnswer ? 'selected' : '';
                questionHtml +=
                    '<div class="choice-item ' + isSelected + '" data-choice="' + choice.key + '">' +
                        '<span class="choice-key">' + choice.key + '.</span>' +
                        '<span class="choice-value">' + choice.value + '</span>' +
                    '</div>';
            });
            questionHtml += '</div>';
        }

        // Render peer data if available
        if (this.fileManager.currentData && this.fileManager.currentData.peerData) {
            questionHtml += this.renderPeerData(question.id);
        }

        questionHtml += '</div>';
        return questionHtml;
    };

    App.prototype.renderTable = function(tableData) {
        if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
            return '';
        }

        var tableHtml = '<div class="data-table-container"><table class="data-table">';

        // Header row
        if (tableData.length > 0) {
            tableHtml += '<thead><tr>';
            tableData[0].forEach(function(header) {
                tableHtml += '<th>' + header + '</th>';
            });
            tableHtml += '</tr></thead>';
        }

        // Data rows
        tableHtml += '<tbody>';
        for (var i = 1; i < tableData.length; i++) {
            tableHtml += '<tr>';
            tableData[i].forEach(function(cell) {
                tableHtml += '<td>' + cell + '</td>';
            });
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody>';

        tableHtml += '</table></div>';
        return tableHtml;
    };

    App.prototype.renderPeerData = function(questionId) {
        if (!this.fileManager.currentData || !this.fileManager.currentData.peerData) {
            console.log("No peer data available for question", questionId);
            return '';
        }

        var peerData = this.fileManager.currentData.peerData;
        if (!peerData || Object.keys(peerData).length === 0) {
            console.log("Peer data is empty for question", questionId);
            return '';
        }

        console.log("Rendering peer data for question", questionId, "with", Object.keys(peerData).length, "peers");

        var peerAnswers = [];
        var answerCounts = {};

        // Collect peer answers for this question
        Object.keys(peerData).forEach(function(username) {
            var studentData = peerData[username];
            console.log("Checking peer:", username, "data:", studentData);

            if (studentData.answers && studentData.answers[questionId]) {
                var answer = studentData.answers[questionId];
                console.log("Found answer for", username, ":", answer);

                peerAnswers.push({
                    username: username,
                    value: answer.value,
                    reasoning: answer.reasoning || ''
                });

                // Count answer distribution
                if (!answerCounts[answer.value]) {
                    answerCounts[answer.value] = 0;
                }
                answerCounts[answer.value]++;
            } else {
                console.log("No answer found for", username, "on question", questionId);
            }
        });

        if (peerAnswers.length === 0) {
            return '';
        }

        var peerHtml = '<div class="peer-data-section">';
        peerHtml += '<h4>Peer Responses (' + peerAnswers.length + ' students)</h4>';

        // Answer distribution
        peerHtml += '<div class="answer-distribution">';
        peerHtml += '<h5>Answer Distribution:</h5>';
        var sortedChoices = Object.keys(answerCounts).sort();
        sortedChoices.forEach(function(choice) {
            var count = answerCounts[choice];
            var percentage = Math.round((count / peerAnswers.length) * 100);
            peerHtml += '<div class="distribution-item">';
            peerHtml += '<span class="choice-label">' + choice + ':</span>';
            peerHtml += '<span class="choice-count">' + count + ' (' + percentage + '%)</span>';
            peerHtml += '<div class="distribution-bar">';
            peerHtml += '<div class="distribution-fill" style="width: ' + percentage + '%"></div>';
            peerHtml += '</div>';
            peerHtml += '</div>';
        });
        peerHtml += '</div>';

        // Individual peer responses
        peerHtml += '<div class="peer-responses">';
        peerHtml += '<h5>Individual Responses:</h5>';
        peerAnswers.forEach(function(peer) {
            peerHtml += '<div class="peer-response">';
            peerHtml += '<strong>' + peer.username + ':</strong> ' + peer.value;
            if (peer.reasoning) {
                peerHtml += '<div class="peer-reasoning">"' + peer.reasoning + '"</div>';
            }
            peerHtml += '</div>';
        });
        peerHtml += '</div>';

        peerHtml += '</div>';
        return peerHtml;
    };

    App.prototype.renderCharts = function() {
        var self = this;
        // Look for any chart containers and render charts using the golden renderChart function
        var chartContainers = document.querySelectorAll('[data-chart-id]');
        chartContainers.forEach(function(container) {
            var chartId = container.getAttribute('data-chart-id');
            var questionId = chartId.replace('_chart', '');

            // Find the question data
            var organizedCurriculum = self.fileManager.getOrganizedCurriculum();
            var question = null;
            Object.keys(organizedCurriculum).forEach(function(unitNum) {
                organizedCurriculum[unitNum].questions.forEach(function(q) {
                    if (q.id === questionId) {
                        question = q;
                    }
                });
            });

            if (question && question.attachments && (question.attachments.chartType || question.attachments.charts)) {
                try {
                    // Use the golden renderChart function with the actual DOM element
                    // Pass the entire attachments object as the chart data
                    window.Charting.renderChart(container, question.attachments);
                    console.log("Chart rendered for question:", questionId);
                } catch (error) {
                    console.error("Error rendering chart for question", questionId, ":", error);
                    container.innerHTML = '<p class="error">Error rendering chart: ' + error.message + '</p>';
                }
            }
        });
    };

    App.prototype.showLessonSelector = function(unitId) {
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('lesson-selector').style.display = 'block';
        console.log("Returned to lesson selector for Unit", unitId);
    };

    App.prototype.setupAnswerChoiceListeners = function() {
        var self = this;
        var choiceItems = document.querySelectorAll('.choice-item');

        choiceItems.forEach(function(choiceItem) {
            choiceItem.addEventListener('click', function() {
                var questionId = this.closest('.question-item').getAttribute('data-question-id');
                var selectedChoice = this.getAttribute('data-choice');

                self.submitAnswer(questionId, selectedChoice);
            });
        });

        console.log("Answer choice listeners set up for", choiceItems.length, "choices.");
    };

    App.prototype.submitAnswer = function(questionId, selectedChoice) {
        var self = this;

        console.log("Submitting answer for question", questionId + ":", selectedChoice);

        // Save the answer via FileManager
        var success = this.fileManager.saveAnswer(questionId, selectedChoice, '');

        if (success) {
            // Re-render the specific question to update its visual state
            this.updateQuestionDisplay(questionId);

            console.log("Answer submitted successfully for", questionId);
        } else {
            console.error("Failed to save answer for", questionId);
            alert("Failed to save answer. Please ensure you have a file loaded.");
        }
    };

    App.prototype.updateQuestionDisplay = function(questionId) {
        var self = this;
        var questionElement = document.querySelector('[data-question-id="' + questionId + '"]');

        if (!questionElement) {
            console.error("Question element not found for", questionId);
            return;
        }

        // Find the question data
        var organizedCurriculum = this.fileManager.getOrganizedCurriculum();
        var question = null;

        Object.keys(organizedCurriculum).forEach(function(unitNum) {
            organizedCurriculum[unitNum].questions.forEach(function(q) {
                if (q.id === questionId) {
                    question = q;
                }
            });
        });

        if (!question) {
            console.error("Question data not found for", questionId);
            return;
        }

        // Re-render just this question
        var updatedQuestionHtml = this.renderQuestion(question);
        questionElement.outerHTML = updatedQuestionHtml;

        // Re-attach event listeners for this question's choices
        var newQuestionElement = document.querySelector('[data-question-id="' + questionId + '"]');
        var choiceItems = newQuestionElement.querySelectorAll('.choice-item');

        choiceItems.forEach(function(choiceItem) {
            choiceItem.addEventListener('click', function() {
                var questionId = this.closest('.question-item').getAttribute('data-question-id');
                var selectedChoice = this.getAttribute('data-choice');

                self.submitAnswer(questionId, selectedChoice);
            });
        });

        // Re-render any charts for this question
        if (question.attachments && (question.attachments.chartType || question.attachments.charts)) {
            var chartContainer = newQuestionElement.querySelector('[data-chart-id]');
            if (chartContainer) {
                try {
                    window.Charting.renderChart(chartContainer, question.attachments);
                    console.log("Chart re-rendered for question:", questionId);
                } catch (error) {
                    console.error("Error re-rendering chart for question", questionId, ":", error);
                    chartContainer.innerHTML = '<p class="error">Error rendering chart: ' + error.message + '</p>';
                }
            }
        }

        console.log("Question display updated for", questionId);
    };

    App.prototype.showUnitMenu = function() {
        document.getElementById('lesson-selector').style.display = 'none';
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('unit-menu').style.display = 'block';
        console.log("Returned to unit menu.");
    };

    window.App = App;

})(window);