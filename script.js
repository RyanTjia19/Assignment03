
var simple = {};
var test = ["hi"];
var set;

//Gets the correct data for the correct quiz
//For now, it'll be one quiz so there will be no parameter
var GetData = () => {
	fetch("https://my-json-server.typicode.com/RyanTjia19/QuizQuestions/Simple")
	.then((response) => {
		return response.json();
	})
	.then((results) => {
		simple = results;
		set = [simple, test];
	})
}

var render_view = (viewId) => {

	//Have access to the template used
	var source = document.querySelector(viewId).innerHTML;
	var template = Handlebars.compile(source);

	//Randomize the question
	var typeRandom = Math.floor(Math.random() * set.length);
	var chosenType = set[typeRandom];

	var questionRandom = Math.floor(Math.random() * chosenType.length);
	var html = template(chosenType[questionRandom]);

	document.querySelector("#view_template").innerHTML = html;
	console.log(chosenType);
}