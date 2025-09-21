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

        this.markDirty(true);

        return this.currentData;
    };

    FileManager.prototype.loadFile = function(file) {
        var self = this;

        return new Promise(function(resolve, reject) {
            var reader = new FileReader();

            reader.onload = function(e) {
                try {
                    var data = JSON.parse(e.target.result);

                    // Check if this is a legacy file format (v1.x)
                    if (data.username && data.users && !data.metadata) {
                        console.log("Detected legacy file format, converting to v2.0...");

                        // Convert legacy format to v2.0 format
                        var legacyUsername = data.username;
                        var legacyAnswers = data.users[legacyUsername] ? data.users[legacyUsername].answers : {};

                        self.currentData = {
                            version: "2.0",
                            metadata: {
                                username: legacyUsername,
                                created: data.exportTime || new Date().toISOString(),
                                convertedFrom: "legacy"
                            },
                            personalData: {
                                answers: legacyAnswers || {}
                            },
                            peerData: null
                        };

                        self.currentUsername = legacyUsername;
                        console.log("Legacy file converted for:", self.currentUsername);

                    } else if (data.metadata && data.metadata.username) {
                        // This is already v2.0 format
                        self.currentData = data;
                        self.currentUsername = data.metadata.username;
                        console.log("v2.0 file loaded for:", self.currentUsername);

                    } else {
                        throw new Error("Unrecognized file format. Missing required fields.");
                    }

                    self.markDirty(false);
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

        var self = this;
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log("File saved and resources cleaned up.");
            self.markDirty(false);
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

    FileManager.prototype.getOrganizedCurriculum = function() {
        var rawCurriculum = window.EMBEDDED_CURRICULUM || [];
        var rawUnitsData = window.ALL_UNITS_DATA || [];

        if (!rawCurriculum || !Array.isArray(rawCurriculum)) {
            console.error("getOrganizedCurriculum: EMBEDDED_CURRICULUM is missing or not an array.");
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
                    unitInfo: {
                        name: 'Unit ' + unitNum,
                        lessonNumbers: new Set(),
                        displayName: 'Unit ' + unitNum
                    },
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
                    organized[unitNum].unitInfo.name = unitMeta.displayName || organized[unitNum].unitInfo.name;
                    organized[unitNum].unitInfo.displayName = unitMeta.displayName || organized[unitNum].unitInfo.displayName;
                }
            });
        } else {
            console.warn("getOrganizedCurriculum: ALL_UNITS_DATA is missing. Unit names will be generic.");
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