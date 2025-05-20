let sessionCards = [];

function initSession() {
    sessionCards = [];
}

function renderCard(verb) {
    let card = { verb, correct: false, attempts: 0, rip: false };
    sessionCards.push(card);

    let div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = /*html*/`
        <div class="card-text">
            <span class="card-menu-switch">...</span>
            <div class="card-menu" hidden>
                <span class="card-menu-see-details">See verb details</span>
                <span class="card-menu-show-form-definition">Show form definition</span>
                <span class="card-menu-reveal-answer">Reveal answer</span>
            </div>
            ${verb.main.meaning ? /*html*/`<span class="card-meaning" title="${verb.meaning ? verb.meaning : ''}">${verb.main.meaning.split(', ')[0]}</span>` : /*html*/`<span class="card-meaning">-</span>`}
            <span class="card-title">${verb.main.word}</span>
            <span class="card-hiragana">${wanakana.toHiragana(verb.main.romaji)}</span>
            <span class="card-form">${verb.form}</span>
        </div>
        <div class="card-input">
            <input type="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="next" />
        </div>
    `;
    let menuSwitch = div.querySelector('.card-menu-switch');
    let menu = div.querySelector('.card-menu');
    menuSwitch.addEventListener('click', e => {
        menu.hidden = !menu.hidden;
    });
    let input = div.querySelector('input');
    div.getElementsByClassName('card-menu-see-details')[0].addEventListener('click', e => {
        let a = document.createElement('a');
        a.href = `https://www.japaneseverbconjugator.com/VerbDetails.asp?txtVerb=${verb.main.word}`;
        a.target = '_blank';
        a.click();
    });
    div.getElementsByClassName('card-menu-show-form-definition')[0].addEventListener('click', e => {
        showFormDefinition(verb.simpleForm);
    });
    div.getElementsByClassName('card-menu-reveal-answer')[0].addEventListener('click', e => {
        input.value = verb.word;
        input.disabled = true;
        input.parentElement.parentElement.classList.add('wrong');
        div.getElementsByClassName('card-menu-reveal-answer')[0].hidden = true;
        card.rip = true;
    });
    input.addEventListener('focus', e => {
        div.classList.add('card-focused');
    });
    input.addEventListener('blur', e => {
        div.classList.remove('card-focused');
    });
    input.addEventListener('keyup', e => {
        if (e.keyCode === 13) { // Enter
            e.preventDefault();
            let input = e.target;
            let answer = input.value.trim().toLowerCase();
            card.attempts++;
            if (
                wanakana.toHiragana(answer) === wanakana.toHiragana(verb.romaji.replace(/\s/g, '')) ||
                wanakana.toHiragana(answer) === wanakana.toHiragana(verb.romaji.replace(/\s/g, '').replace(/ō/g, 'ou')) ||
                wanakana.toHiragana(answer).replace(/ou/g, 'uou') === wanakana.toHiragana(verb.romaji.replace(/\s/g, '').replace(/ō/g, 'ou'))
            ) {
                card.correct = true;
                input.disabled = true;
                input.parentElement.parentElement.classList.add('correct');
                input.value = verb.word;
                div.getElementsByClassName('card-menu-reveal-answer')[0].hidden = true;
            } else {
                if(showAnswerOnWrongInput.checked) {
                    input.parentElement.parentElement.classList.add('wrong');
                    input.value = verb.word;
                    input.disabled = true;
                    div.getElementsByClassName('card-menu-reveal-answer')[0].hidden = true;
                    card.rip = true;
                } else {
                    input.parentElement.parentElement.classList.remove('incorrect');
                    setTimeout(() => input.parentElement.parentElement.classList.add('incorrect'), 10);
                }
            }
            if(card.attempts > 1 && !card.correct) return;
            let nextCard = div.nextElementSibling;
            while(nextCard && (nextCard.classList.contains('correct') || nextCard.classList.contains('wrong'))) {
                nextCard = nextCard.nextElementSibling;
            }
            if (nextCard) {
                nextCard.querySelector('input').focus();
            }
        } else if(e.keyCode === 37 && e.target.selectionStart === 0) { // Left
            let prevCard = div.previousElementSibling;
            while(prevCard && (prevCard.classList.contains('correct') || prevCard.classList.contains('wrong'))) {
                prevCard = prevCard.previousElementSibling;
            }
            if (prevCard) {
                prevCard.querySelector('input').focus();
            }
        } else if(e.keyCode === 39 && e.target.selectionStart === e.target.value.length) { // Right
            let nextCard = div.nextElementSibling;
            while(nextCard && (nextCard.classList.contains('correct') || nextCard.classList.contains('wrong'))) {
                nextCard = nextCard.nextElementSibling;
            }
            if (nextCard) {
                nextCard.querySelector('input').focus();
            }
        }
    });
    return div;
}

document.addEventListener('click', e => {
    if (e.target.className !== 'card-menu-switch') {
        setTimeout(() => document.querySelectorAll('.card-menu').forEach(menu => menu.hidden = true), 0);
    }
});