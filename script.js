//Json object to keep track of question count
var TitleQuiz = {
	"name": "",
	"currentQuestion": 0,
	"totalQuestions": 0,
	"correctResponses": 0
}

//Default choice
var choice = -1;

//Set of stored questions
var set = [];
var chosenQuestion;

document.addEventListener("DOMContentLoaded", ()=> {

	//This is event delegation, any child member of "view_template" will trigger this
	document.querySelector("#view_template").onclick = (e) => {
		handle_event(e);
	}
})

function handle_event(e) {

	//Checks for multiple choices (their id is a number)
	//Store the user's answer
	if (parseInt(e.target.id) >= 0) {
		choice = e.target.id;
	}

	//Submit button and resets the user's choice
	else if (e.target.id == "submit") {

		if (choice >= 0) {
			checkAnswer(choice);
			choice = -1;
		}
		
		else {
			alert("Please choose an answer");
		}
	}

	//Submit button for the 'List' question
	else if (e.target.id == "listSubmit") {
		var value = document.querySelector('#options').value;

		if (value >= 0) {
			checkAnswer(value);
		}
		
		else {
			alert("Please choose an answer");
		}
	}

	//When the user understood why the correct answer is correct
	else if (e.target.id == "understood") {
		updatePage();
	}
}

//Gets the correct data for the correct quiz
var GetData = (quiz) => {
	fetch(`https://my-json-server.typicode.com/RyanTjia19/QuizQuestions/${quiz}`)
	.then((response) => {
		return response.json();
	})
	.then((results) => {
		set = results;
	})
	.then(() => {
		//Access the quiz template
		var source = document.querySelector('#Quiz').innerHTML;
		var template = Handlebars.compile(source);

		//Initialize/reset the 'TitleQuiz' json
		TitleQuiz['name'] = quiz;
		TitleQuiz['currentQuestion'] = 1;
		TitleQuiz['totalQuestions'] = totalCount(set);
		TitleQuiz['correctResponses'] = 0;
		var html = template(TitleQuiz);

		document.querySelector("#view_template").innerHTML = html;
	})
	.then(() => {
		view_question();
	})
}

//Picks the template based on the type of question
var view_question = () => {

	//Randomize the question
	//First by type
	var typeRandom = Math.floor(Math.random() * set.length);
	var chosenType = set[typeRandom][Object.keys(set[typeRandom])];
	/*
	Since the keys of the json object are their index and not by the question types,
	the first 'set[typeRandom]' is to get the question type by their index.
	However, object returned is something like this {questionType:array}, so we don't have direct
	access to the array that contains the questions.
	Which is why 'Object.keys(set[typeRandom])' is used since it returns the key of that question type.
	In the end, the code could be seen like this:
		var chosenType = set[typeRandom] -- returns the question type
		questions = chosenType[Object.keys(set[TypeRandom])] -- returns the set of questions
	*/

	//Then by question
	var questionRandom = Math.floor(Math.random() * chosenType.length);
	chosenQuestion = chosenType[questionRandom];

	//Access the template used, depending on the question type
	var source = document.querySelector(`#${Object.keys(set[typeRandom])}`).innerHTML;
	var template = Handlebars.compile(source);
	var html = template(chosenQuestion);
	document.querySelector("#quizQuestions").innerHTML = html;

	//Remove that question since it's been used
	delete chosenType[questionRandom];
	chosenType.sort();
	chosenType.pop();

	//Check if the question type have no more questions
	//If so, then remove that question type
	if (chosenType.length == 0) {
		delete set[typeRandom];
		set.sort();
		set.pop();
	}
}

//Method to return the total amount questions
function totalCount(jsonObject) {
	var count = 0;

	//loop through the dictionary
	Object.entries(jsonObject).forEach(([key, value]) => {

		//loop through the inner dictionary (even there's only 1 pair)
		var innerDictionary = value;
		Object.entries(innerDictionary).forEach(([key, value]) => {
			
			//Add the length of the array to count
			count = count + value.length;
		})
	})

	return count;
}

//Method to update the page without reloading
var updatePage = function() {
	var source;
	var template;

	//Checks if there are any more questions left
	if (set.length > 0) {

		//Access the quiz template
		source = document.querySelector('#Quiz').innerHTML;

		//Initialize/reset the 'TitleQuiz' json
		TitleQuiz['currentQuestion'] = TitleQuiz['currentQuestion'] + 1;
	}

	//Otherwise, show the result
	else {

		//Result template
		source = document.querySelector('#resultTemplate').innerHTML;
		
		//Shows the percentage
		var percentage = (TitleQuiz['correctResponses'] / TitleQuiz['totalQuestions']) * 100;
		TitleQuiz['percentage'] = percentage;
	}

	var template = Handlebars.compile(source);
	var html = template(TitleQuiz);
	document.querySelector("#view_template").innerHTML = html;

	//Calls this function only if there are still questions
	if (set.length > 0) {

		//Next question
		view_question();
	}
}

//Method to check the answer
function checkAnswer(number) {

	//Add a new property to the chosenQuestion object to serve as the correct answer on text
	var correctAnswer;

	//If the response is incorrect, then add a new property to the chosenQuestion object
	//The existence of the correctAnswer property in the object will determine if the user is incorrect
	if (chosenQuestion['Answer'] != number) {
		if ('Choices' in chosenQuestion) { //This is for when the question provides multiple choices
			correctAnswer = chosenQuestion['Choices'];
			correctAnswer = correctAnswer[chosenQuestion['Answer']];
			correctAnswer = correctAnswer['Answer'];
		}
		else if (chosenQuestion['Answer'] == 0) { //When the answer is 'true'
			correctAnswer = 'True';
		}
		else if (chosenQuestion['Answer'] == 1) { //When the answer is 'false'
			correctAnswer = 'False';
		}
		chosenQuestion.CorrectAnswer = correctAnswer;
	}
	else {
		TitleQuiz['correctResponses'] = TitleQuiz['correctResponses'] + 1;
		setTimeout(() => {updatePage();}, 1000);
	}

	var source = document.querySelector('#Reaction').innerHTML;
	var template = Handlebars.compile(source);
	var html = template(chosenQuestion);

	//Changing the template and their css
	document.querySelector(".background").className += ' overlapBackground';
	document.querySelector("#response").innerHTML = html;
}