var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mood: String,
  reason: String,
  answers: [
    {
      answer_content: {
        type: String,
        required: true
      },
      answer_mood: String,
      answer_reason: String,
      answer_genre: [
        {
          id: String,
          title: String
        }
      ]
    }
  ]
});

module.exports = mongoose.model('Question', QuestionSchema);
