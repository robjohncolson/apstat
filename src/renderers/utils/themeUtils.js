

function isDarkMode() {
    return document.body.classList.contains('dark-theme');
}

function getTextColor() {
    return isDarkMode() ? '#e0e0e0' : '#333333';
}

function getGridColor() {
    return isDarkMode() ? '#444444' : '#e0e0e0';
}

function getScatterPointColor() {
    return isDarkMode() ? '#5BC0EB' : '#36A2EB';
}

export { isDarkMode, getTextColor, getGridColor, getScatterPointColor };