export interface Question {
  text: string;
  answer: string; 
  _id: string;
  type: 'Texto' | 'Sí/No'; 
}

export interface Section {
  name: string;
  questions: Question[];
}

export interface Questionnaire {
  _id: string;
  name: string;
  sections: Section[];
  vehiculo?: string;
}