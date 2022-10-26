var render_view = (viewId, modelIndex) => {
	var source = document.querySelector(viewId).innerHTML;
	var template = Handlebars.compile(source);
	var html = template(model[modelIndex]);

	document.querySelector("#view_template").innerHTML = html;
}