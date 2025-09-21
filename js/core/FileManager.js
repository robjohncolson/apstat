// js/core/FileManager.js
// Handles all file I/O, data state, and dirty tracking.
(function(window) {
    'use strict';

    function FileManager() {
        this.currentData = null;
        this.currentUsername = null;
        this.isDirty = false;
        console.log("FileManager constructed.");
    }

    FileManager.prototype.createNewFile = function(username) {
        if (!username || username.trim() === '') {
            alert("Username cannot be empty.");
            return;
        }
        this.currentUsername = username;
        this.currentData = {
            version: "2.0",
            metadata: {
                username: this.currentUsername,
                created: new Date().toISOString()
            },
            personalData: {
                answers: {}
            },
            peerData: null
        };
        console.log("Created new file for:", this.currentUsername);
        
        // ******************** FIX #1 ********************
        // In the previous version, the 'this' context was correct here,
        // but let's ensure it's robust. The error was likely due to how
        // it was called. The real fix is in loadFile.
        this.markDirty(true); 
        
        return this.currentData;
    };

    FileManager.prototype.loadFile = function(file) {
        var self = this; // ******************** FIX #2 (CRITICAL) ********************
                         // We capture the correct 'this' context here.

        return new Promise(function(resolve, reject) {
            var reader = new FileReader();

            reader.onload = function(e) {
                try {
                    var data = JSON.parse(e.target.result);
                    self.currentData = data;
                    self.currentUsername = data.metadata.username;

                    // ******************** FIX #3 ********************
                    // Use 'self' instead of 'this' inside the callback.
                    self.markDirty(false);

                    console.log("File loaded successfully for:", self.currentUsername);
                    resolve(self.currentData);
                } catch (error) {
                    console.error("Error parsing JSON from file:", error);
                    alert("Failed to read the file. It may be corrupted or not a valid JSON file.");
                    reject(error);
                }
            };

            reader.onerror = function() {
                console.error("FileReader error.");
                alert("An error occurred while reading the file.");
                reject(new Error("FileReader error."));
            };

            reader.readAsText(file);
        });
    };
    
    FileManager.prototype.saveFile = function() {
        if (!this.currentData) {
            alert("No data to save. Load or create a new file first.");
            return;
        }

        var dataStr = JSON.stringify(this.currentData, null, 2);
        var blob = new Blob([dataStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        
        var a = document.createElement('a');
        a.href = url;
        a.download = this.currentUsername + '_progress.json';
        document.body.appendChild(a);
        a.click();
        
        var self = this; // Capture 'this' context for the timeout
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log("File saved and resources cleaned up.");
            self.markDirty(false); // Use 'self' here too for consistency
        }, 0);
    };

    FileManager.prototype.markDirty = function(isDirty) {
        this.isDirty = isDirty;
        console.log("File dirty state set to:", this.isDirty);
        
        var event = new CustomEvent('filestatuschange', { 
            detail: { isDirty: this.isDirty, username: this.currentUsername } 
        });
        window.dispatchEvent(event);
    };

    // --- (Keep the getOrganizedCurriculum and calculateUnitProgress methods as they are) ---
    FileManager.prototype.getOrganizedCurriculum = function(rawCurriculum, rawUnitsData) {
        if (!rawCurriculum || !Array.isArray(rawCurriculum)) {
            console.error("getOrganizedCurriculum: rawCurriculum is missing or not an array.");
            return {};
        }
        var organized = {};
        rawCurriculum.forEach(function(question) {
            if (!question.id) return;
            var idParts = question.id.split('-');
            if (idParts.length < 3) return;
            var unitNum = idParts[0].replace('U', '');
            var lessonNum = idParts[1].replace('L', '');
            if (!organized[unitNum]) {
                organized[unitNum] = {
                    unitInfo: { name: 'Unit ' + unitNum, lessonNumbers: new Set() },
                    questions: []
                };
            }
            organized[unitNum].questions.push(question);
            organized[unitNum].unitInfo.lessonNumbers.add(lessonNum);
        });
        if (rawUnitsData && Array.isArray(rawUnitsData)) {
            rawUnitsData.forEach(function(unitMeta) {
                if (!unitMeta.unitId) return;
                var unitNum = unitMeta.unitId.replace('unit', '');
                if (organized[unitNum]) {
                    organized[unitNum].unitInfo.name = unitMeta.displayName;
                }
            });
        } else {
            console.warn("getOrganizedCurriculum: rawUnitsData is missing. Unit names will be generic.");
        }
        Object.keys(organized).forEach(function(unitNum) {
            organized[unitNum].unitInfo.lessonNumbers = Array.from(organized[unitNum].unitInfo.lessonNumbers).sort(function(a, b) {
                return parseInt(a) - parseInt(b);
            });
        });
        console.log("Curriculum organized into", Object.keys(organized).length, "units.");
        return organized;
    };

    FileManager.prototype.calculateUnitProgress = function(unitData) {
        if (!this.currentData || !this.currentData.personalData.answers) {
            return { completed: 0, total: unitData.questions.length, percent: 0 };
        }
        var completed = 0;
        var answers = this.currentData.personalData.answers;
        unitData.questions.forEach(function(q) {
            if (answers[q.id] !== undefined) {
                completed++;
            }
        });
        var total = unitData.questions.length;
        var percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed: completed, total: total, percent: percent };
    };

    window.FileManager = FileManager;

})(window);