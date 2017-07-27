

// Functions

const offsetCalc = currentPageNum => (currentPageNum-1)*10

const totalNumPagesCalc = totalNumComments => Math.ceil(totalNumComments/10)

const totalNumSectionsCalc = totalNumPages => Math.ceil(totalNumPages/5)

const currentSectionTotalNumPagesCalc = (currentSectionNum,totalNumSections,totalNumComments) => {
    if (currentSectionNum !== totalNumSections) {
        return 5;
    } else if (currentSectionNum === totalNumSections) {
        let lastSectionTotalNumComments = totalNumComments - (currentSectionNum-1)*50;
        return Math.ceil(lastSectionTotalNumComments/10);
    } else {
        console.log('currentSectionTotalNumPage: Error Occurred!');
        console.log('currentSectionNum: ',currentSectionNum);
        console.log('totalNumSections: ',totalNumSections);
        return;
    };
};

const currentSectionPagesNumRangeCalc = (currentSectionNum,currentSectionTotalNumPages) => {
    let currentSectionPagesNumRange = [];
	for (var i=(currentSectionNum-1)*5+1; i <= (currentSectionNum-1)*5+currentSectionTotalNumPages; i++) {
	    currentSectionPagesNumRange.push(i);
	};

    return currentSectionPagesNumRange;
}

const previousSectionExistsCalc = currentSectionNum => currentSectionNum !== 1

const nextSectionExistsCalc = (currentSectionNum,totalNumSections) => currentSectionNum !== totalNumSections

const paginationValidChecker = (currentSectionNum,currentPageNum,totalNumSections,totalNumPages,currentSectionTotalNumPages) => {
	if (currentPageNum <= 0 || currentPageNum > totalNumPages) {
		console.log(`currentPageNum (${currentPageNum}) is less than/equal to 0 OR greater than totalNumPages (${totalNumPages})`);
		return false;
	} else if (currentSectionNum <= 0 || currentSectionNum > totalNumSections) {
		console.log(`currentSectionNum (${currentSectionNum}) is less than/equal to 0 OR greater than totalNumSections (${totalNumSections})`);
		return false;
	} else if (currentPageNum < (currentSectionNum-1)*5+1 || currentPageNum > (currentSectionNum-1)*5+currentSectionTotalNumPages) {
		console.log(`currentPageNum (${currentPageNum}) out of range`);
		return false;
	} else {
		console.log(`currentSectionNum (${currentSectionNum}) and currentPageNum (${currentPageNum}) are valid`);
		return true;
	};
};


const main = () => {
	let currentSectionNum = 2,
		currentPageNum = 1,
		totalNumComments = 73;

	console.log('');
	console.log('');
	console.log('');
	console.log('********************************************************');
	let offset = offsetCalc(currentPageNum),
		totalNumPages = totalNumPagesCalc(totalNumComments),
		totalNumSections = totalNumSectionsCalc(totalNumPages),
		currentSectionTotalNumPages = currentSectionTotalNumPagesCalc(currentSectionNum,totalNumSections,totalNumComments),
		currentSectionPagesNumRange = currentSectionPagesNumRangeCalc(currentSectionNum,currentSectionTotalNumPages),
		previousSectionExists = previousSectionExistsCalc(currentSectionNum),
		nextSectionExists = nextSectionExistsCalc(currentSectionNum,totalNumSections),
		isPaginationValid = paginationValidChecker(currentSectionNum,currentPageNum,totalNumSections,totalNumPages,currentSectionTotalNumPages);



	console.log('********************************************************');
	console.log('currentSectionNum: ',currentSectionNum);
	console.log('currentPageNum: ',currentPageNum);
	console.log('totalNumComments: ',totalNumComments);

	console.log('********************************************************');

	console.log('offset: ',offset);
	console.log('totalNumPages: ',totalNumPages);
	console.log('totalNumSections: ',totalNumSections);
	console.log('currentSectionTotalNumPages: ',currentSectionTotalNumPages);
	console.log('currentSectionPagesNumRange: ',currentSectionPagesNumRange);
	console.log('previousSectionExists: ',previousSectionExists);
	console.log('nextSectionExists: ',nextSectionExists);
	console.log('isPaginationValid: ',isPaginationValid);
	console.log('********************************************************');
}

main();