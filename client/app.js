class Model {
  constructor() {
    this.csvString = '';
    this.history = [];
  }
}

class View {
  constructor(model) {
    this.model = model;
    this.render();
  }

  renderResponse() {
    var newString = this.model.csvString.replace(/\n/g, '<br/>');
    $('#csv').html(newString);
  }

  render() {
    this.renderResponse();
    var $history = $('#history');
    $history.html('');
    for(var i = 0; i < this.model.history.length; i++) {
      var h =  this.model.history[i];
      var li = $('<li></li>');
      li.text(h.date);
      li.data('index', i);
      $history.append(li);
    }
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    $('#submit').on('click', this.handleSubmit.bind(this));
    $('#file-input').on('change', this.handleFileInput.bind(this));
  }

  post(input) {
    $.ajax({
      type: 'POST',
      url: 'http://127.0.0.1:3000',
      dataType: 'json',
      data: JSON.stringify(JSON.parse(input)),
      success: this.handleServerResponse.bind(this),
      error: function(err) {
        console.error(err);
      }
    });
  }

  handleFileInput(event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function(event) {
      $('#input-json').val(event.target.result);
    };
    reader.readAsText(input.files[0]);
  }

  handleHistoryClick(event) {
    var index = $(event.target).data('index');
    this.model.csvString = this.model.history[index].text;
    this.view.render();
    $('li').on('click', this.handleHistoryClick.bind(this));
  }

  handleServerResponse(res) {
    this.model.csvString = res.results;
    this.model.history.push({
      text: res.results,
      date: new Date()
    });
    this.view.render();
    $('li').on('click', this.handleHistoryClick.bind(this));
  }

  handleSubmit() {
    var input = $('#input-json').val();
    $('#input-json').val('');
    $('#file-input').val('');;
    this.post(input);
  }
}

var app = function () {
  var m = new Model();
  var v = new View(m);
  var c = new Controller(m, v);
}

$(document).ready(function () {
  app();
});
