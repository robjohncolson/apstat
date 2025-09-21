
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
                alert('Clicked on Unit ' + unitId + ', Lesson ' + lessonId + '. Question display coming next!');
                // self.selectLesson(unitId, lessonId); // This will be Phase 3
            });
        });

        console.log("Lesson selector rendered for Unit", unitId, "with", lessons.length, "lessons.");
    };

    App.prototype.showUnitMenu = function() {
        document.getElementById('lesson-selector').style.display = 'none';
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('unit-menu').style.display = 'block';
        console.log("Returned to unit menu.");
    };

    window.App = App;

})(window);