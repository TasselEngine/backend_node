import { Injectable } from "@bonbons/core";

@Injectable()
export class AuthService {

  validate(token?: string) {
    return (token && true) || false;
  }

}