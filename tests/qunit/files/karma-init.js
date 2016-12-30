window.fixture = document.createElement('div');
window.fixture.id = 'fixture';
document.body.appendChild(window.fixture);

QUnit.testDone(function () {
    window.fixture.innerHTML = '';
});
