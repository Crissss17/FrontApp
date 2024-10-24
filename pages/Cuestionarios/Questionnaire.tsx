export interface Question {
  text: string;
  answer: string;
}

export interface Questionnaire {
  _id: string;
  name: string;
  questions: Question[];
}
