// js/app.js
// Main application controller.
// NO ES6 modules - Global namespace pattern
(function(window) {
    'use strict';

    function App() {
        this.fileManager = new window.FileManager();
        // Placeholders for future components
        this.uiRenderer = null; 
        this.curriculum = window.CURRICULUM || []; // Get data loaded from questions.js
        console.log("App constructed.");
    }

    App.prototype.init = function() {
        console.log("App.init() called.");
        this.setupEventListeners();
        this.updateUI();
        console.log("Curriculum loaded with", this.curriculum.length, "questions.");
    };

    App.prototype.setupEventListeners = function() {
        var self = this;

        // UI Buttons
        document.getElementById('new-file-btn').addEventListener('click', function() { self.handleNewFile(); });
        document.getElementById('load-file-btn').addEventListener('click', function() { self.handleLoadFile(); });
        document.getElementById('save-file-btn').addEventListener('click', function() { self.handleSaveFile(); });

        // Hidden file input
        var fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (file) {
                self.fileManager.loadFile(file).then(function() {
                    console.log("File loading process completed in App.");
                }).catch(function(err){
                    console.error("File loading failed in App.", err);
                });
            }
        });

        // Listen for status changes from FileManager
        window.addEventListener('filestatuschange', function(e) {
            self.updateUI(e.detail);
        });
    };

    // --- Button Handlers ---
    App.prototype.handleNewFile = function() {
        var username = prompt("Please enter your username (e.g., Apple_Rabbit):");
        if (username) {
            this.fileManager.createNewFile(username);
        }
    };

    App.prototype.handleLoadFile = function() {
        // Trigger the hidden file input
        document.getElementById('file-input').click();
    };

    App.prototype.handleSaveFile = function() {
        this.fileManager.saveFile();
    };

    // Replace the existing updateUI method in js/app.js

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
        saveIndicator.textContent = `File: ${status.username || this.fileManager.currentUsername}`;
        if (status.isDirty) {
            saveIndicator.classList.add('dirty');
            saveIndicator.textContent += " (unsaved)";
        } else {
            saveIndicator.classList.remove('dirty');
            saveIndicator.textContent += " (saved)";
        }
    }

    // Always render the unit menu as the main screen
    this.renderUnitMenu();
    console.log("UI updated and unit menu rendered.");
};

// Add this new method to js/app.js, after updateUI

App.prototype.renderUnitMenu = function() {
    var self = this;
    var unitMenuContainer = document.getElementById('unit-menu');
    var organizedCurriculum = this.fileManager.getOrganizedCurriculum(this.curriculum, window.ALL_UNITS_DATA);
    
    var sortedUnitKeys = Object.keys(organizedCurriculum).sort(function(a, b) {
        return parseInt(a) - parseInt(b);
    });

    var unitsHtml = '';
    sortedUnitKeys.forEach(function(unitNum) {
        var unitData = organizedCurriculum[unitNum];
        var progress = self.fileManager.calculateUnitProgress(unitData);
        var unitName = unitData.unitInfo.name;
        var lessonCount = unitData.unitInfo.lessonNumbers.length;
        var questionCount = unitData.questions.length;

        unitsHtml += `
            <div class="unit-card" data-unit-id="${unitNum}">
                <div class="unit-header">
                    <h3>Unit ${unitNum}</h3>
                    <span class="completion-badge">${progress.percent}%</span>
                </div>
                <div class="unit-title">${unitName}</div>
                <div class="unit-stats">
                    <span>${lessonCount} lessons</span>
                    <span>•</span>
                    <span>${questionCount} questions</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.percent}%"></div>
                </div>
            </div>
        `;
    });

    unitMenuContainer.innerHTML = `
        <div class="curriculum-overview">
            <h2>📚 AP Statistics Curriculum</h2>
            <div class="units-grid">${unitsHtml}</div>
        </div>
    `;

    // Make the cards clickable (we'll add the selectUnit logic later)
    unitMenuContainer.querySelectorAll('.unit-card').forEach(function(card) {
        card.addEventListener('click', function() {
            var unitId = this.getAttribute('data-unit-id');
            alert('Clicked on Unit ' + unitId + '. Lesson selection coming next!');
            // self.selectUnit(unitId); // This will be the next step
        });
    });
};

    // Attach the App constructor to the window
    window.App = App;

})(window);