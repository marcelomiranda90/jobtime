import * as EmailValidator from 'email-validator';

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  cellphone: string;
  category: string;
  premium: string;
  language: string;
  isValidEmail() {
    return EmailValidator.validate(this.email);
  }
}