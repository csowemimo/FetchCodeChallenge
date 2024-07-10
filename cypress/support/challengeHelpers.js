let firstGroup;
let secondGroup;

export function getResetButton() {
    return cy.contains('button', 'Reset');
  }  

export function getWeighButton() {
    cy.wait(2000);
    return cy.get('#weigh');
} 

export function getLeftBowl(index) {
    return cy.get(`#left_${index}`);
}

export function getRightBowl(index) {
    return cy.get(`#right_${index}`);
}

export function getCoinButton(index) {
    return cy.get(`#coin_${index}`);
}

export function getWeighingsComparisons() {
    return cy.get('.game-info ol li');
}

export function checkFakeBar() {  
    return getWeighingsComparisons()
        .last()
        .should('be.visible')
        .invoke('text')
        .then((text) => {
            if (text.includes('<')) {
                return lesserThanWeight(text);
            } else if (text.includes('>')) {
                return greaterThanWeight(text);
            } else {
                equalWeight(text);
                return null;
            }
        });
}

export function getBars() {
    return cy.get('.coins .square').invoke('text').then(text => {
        const group1 = text.substring(0, 2).split('');
        const group2 = text.substring(2, 4).split('');
        const group3 = text.substring(4, 6).split('');
        const group4 = text.substring(6, 8).split('');
        const group5 = text.substring(text.length - 1);

        return { group1, group2, group3, group4, group5 };
    });
}

export function weighBars(groups) {
    if (!groups) {
        return getBars().then(fetchedGroups => {
            firstGroup = `group${1}`;
            secondGroup = `group${2}`;
            return weighBars(fetchedGroups);
        });
    }
    const {group1, group2} = groups;
    
    getResetButton().click();   

    for(let i = 0; i < group1.length; i++) {
        getLeftBowl(i).type(group1[i]);
    }

    for(let i = 0; i < group2.length; i++) {
        getRightBowl(i).type(group2[i]);
    }
    getWeighButton().click();
    checkFakeBar();
}

export function outputData() {
    cy.on('window:alert', (message) => {
        console.log(`alert message: ${message}`);
    });

    getWeighingsComparisons().each((li, index) => {
        const textContent = Cypress.$(li).text(); 
        console.log(`Weighing ${index + 1}: ${textContent}`); 
    });
}

export function selectAnswer(stringArray) {
    if(stringArray.length === 1) {
        getCoinButton(stringArray).click();
            cy.wait(1000)
            outputData();
            return true;
    }
    else {
        return cy.wrap(false);
    }
}

export async function greaterThanWeight(weighInfo) {
    let secondArrayString = weighInfo.split(' ')[2];
    let secondArray = secondArrayString.substring(1, secondArrayString.length - 1).split(',').map(Number); 

    let foundAnswer = await selectAnswer(secondArray);

    if (!foundAnswer) {
        let firstTwoNumbers = secondArray.slice(0, 1); 
        let lastNumber = secondArray.slice(1);

        weighBars({group1: firstTwoNumbers, group2: lastNumber});
        return false;
            } else {
                return foundAnswer;
            }
        
}

export async function lesserThanWeight(weighInfo) {
    let firstArrayString = weighInfo.split(' ')[0]; 
    let firstArray = firstArrayString.substring(1, firstArrayString.length - 1).split(',').map(Number); 

    let foundAnswer = await selectAnswer(firstArray);

        if (!foundAnswer) {
            let firstTwoNumbers = firstArray.slice(0, 1); 
            let lastNumber = firstArray.slice(1);
            weighBars({group1: firstTwoNumbers, group2: lastNumber});
            return false;
        } else {
            return foundAnswer;
        }
}
   

export function equalWeight(weighInfo) {
    const nextGroup = incrementGroup(secondGroup)
    let firstArrayString = weighInfo.split(' ')[0];
    let firstArray = firstArrayString.substring(1, firstArrayString.length - 1).split(',').map(Number);

    getBars().then(fetchGroups => {
        secondGroup = nextGroup;
        const next = fetchGroups[nextGroup];
        weighBars({group1: firstArray, group2: next});
    });
}

function incrementGroup(groupIdentifier) {
    const matches = groupIdentifier.match(/(\D+)(\d+)/);
    if (!matches) {
        throw new Error(`Invalid group identifier: ${groupIdentifier}`);
    }

    const prefix = matches[1];  // Non-numeric part
    let number = parseInt(matches[2], 10);  // Numeric part
    number++;
    return `${prefix}${number}`;
}