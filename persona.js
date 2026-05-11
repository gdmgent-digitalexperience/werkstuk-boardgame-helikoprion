function initPersonaStamp() {
    const stampEl = document.getElementById('personaStamp');
    if (!stampEl) return;

    const params = new URLSearchParams(window.location.search);
    const skinwalkerValue = params.get('skinwalker');
    if (skinwalkerValue === null) return;

    const isSkinwalker = skinwalkerValue === 'true';
    stampEl.classList.add(isSkinwalker ? 'skinwalker' : 'notskinwalker');

    const stampText = document.getElementById('personaStampText');
    if (stampText) {
        stampText.textContent = isSkinwalker ? 'SKINWALKER' : 'NIET DE SKINWALKER';
    }

    stampEl.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', initPersonaStamp);
