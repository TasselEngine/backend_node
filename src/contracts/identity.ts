export enum Role {
  Core = 0,
  Admin = 1,
  User = 2,
  None = 9999
}

export interface IAuthorizeInfo {
  account: string;
  expires: number;
  uid: string;
  role: Role;
}

export type ErrorType = "INVALID_TOKEN" | "EXPIRES" | "VALID";

export interface IAuthorizeData extends IAuthorizeInfo {
  valid: ErrorType;
}

export interface IIdentityDescriptor {
  logined: boolean;
  account: string;
  uid: string;
  role: Role;
}

/**
 * ## 定义Identity，记录身份状态
 * @description
 * @author Big Mogician
 * @export
 * @abstract
 * @class IIdentity
 * @implements {IIdentityDescriptor}
 */
export abstract class IIdentity implements IIdentityDescriptor {
  readonly abstract logined: boolean;
  readonly abstract account: string;
  readonly abstract uid: string;
  readonly abstract role: Role;
  public abstract init(info: IAuthorizeData): void;
  public abstract dispose(): void;
}
