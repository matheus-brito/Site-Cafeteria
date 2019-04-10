
//media queries
let mediaLarge = matchMedia('(min-width: 1220px)');
let mediaNormal = matchMedia('(min-width: 850px) and (max-width: 1220px)');

//Control variables
let allCards = null;
let ordered = null;
let adjusting = false;

//Listeners
window.addEventListener('load', getCardsFile);
window.addEventListener('resize', adjustCards);

mediaLarge.addListener(adjustCards);
mediaNormal.addListener(adjustCards);
document.querySelectorAll("main .slide-box button")
    .forEach(element=> element.addEventListener('click', swipe));

//Functions
function getNumberCards(){
    
    let cardsShown = 0;
    if(mediaLarge.matches){
        console.log('large screen');
        cardsShown = 3;
    } else if(mediaNormal.matches){
        console.log('media screen');
        cardsShown = 2;
    } else{
        console.log('small screen');
        cardsShown = 1;
    }
    return cardsShown;
}

function getNext(element){
    const next = element.nextElementSibling;
    return next? next: allCards[0];
}

function getPrevious(element){
    const prev = element.previousElementSibling;
    return prev? prev: allCards[allCards.length-1];
}

function swipe(event){
    const numberShown = getNumberCards();
    let aux = null;
    let func = null;
    let value = 0;
    if(event.target.classList.contains('left')){
        func = getPrevious;
        value = -1;
    }
    else{
        func = getNext;
        value = 1;
    }

    const p = new Promise((resolve)=>{
        let newCard = null;
        aux = ordered.map((oldCard) => {
            newCard = oldCard;
            for(let i = 0; i < numberShown; ++i){
                newCard = func(newCard);
            }
            return newCard;
        });
        
        ordered.forEach(element => element.classList.add('hidden'));
        aux.forEach(element => element.style.left='50%');
        resolve();
    });
    p.then(()=>{
        ordered = aux;
        adjustCards();
    });
}

function getCardsFile(){
    const cardsContainer = document.querySelector('main div.cards');

    if(cardsContainer === null){ console.error('Could not get Cards File.'); return; }

    fetch('./cards.html')
    .then(res => res.text())
    .then(cards => {
        cardsContainer.innerHTML = cards;
    })
    .then(() => {
        allCards = Array.prototype.slice.call(document.querySelectorAll('main .card')); //define global
        const numberShown =  3;
        for(let i = numberShown; i < allCards.length; ++i){
            allCards[i].classList.add('hidden');
        }
        ordered = allCards.slice(0, numberShown);
        adjustCards();
    });
}

function resizeCards(numberShown){
    const pctg = 0.7;
    const cardHeight = ordered[0].offsetHeight;
    for(let i = 0; i < numberShown; ++i){
        ordered[i].style.width = `${cardHeight*pctg}px`;
    }
}

function centralizeCards(numberShown){
    
    const cardWidth = (ordered[0].offsetWidth/window.innerWidth)*100;

    let positionPrevious = 15 + (70 - numberShown*cardWidth - (numberShown - 1))/2; //arrow.left + initial margin
    let position = 0;

    ordered[0].style.left = `${positionPrevious}%`;
    for(let i = 1; i < numberShown; ++i){
        position = positionPrevious + cardWidth + 1;
        ordered[i].style.left = `${position}%`;
        positionPrevious = position;
    }
}

function adjustCards(){
    const numberShown = getNumberCards();
    const p = new Promise(
        resolve=>{
            for(let i = 0; i < numberShown; ++i){
                ordered[i].classList.remove('hidden');
            }
            for(let i = numberShown; i < ordered.length; ++i){
                ordered[i].classList.add('hidden');
            }
            resolve();
        });
    p.then(
        ()=>{
            resizeCards(numberShown);
            centralizeCards(numberShown);
        }
    );    
}