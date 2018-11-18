import { IConstructor } from "./base";

export interface IQueryWhere<T, TARGET extends keyof T> {
  equal?: Array<T[TARGET]>;
}

export interface IQueryFilter<T> {
  where<TARGET extends keyof T>(target: TARGET, where: IQueryWhere<T, TARGET>): IQueryFilter<T>;
}

interface IFilterGenerator {
  <T>(type: IConstructor<T>): IFilterBuilder<T>;
}

interface IFilterBuilder<T> {
  type: T;
  query<T2 = T>(type?: IConstructor<T2>): IQueryFilter<T2>;
}

interface IFilterCreator<T = any> extends IFilterGenerator, IFilterBuilder<T> {

}

export interface IFilterMeta<T> {
  where: { [prop: string]: IQueryWhere<T, any> };
}

const defaultQueryFilter: IQueryFilter<{ [prop: string]: any }> = {
  // tslint:disable:object-literal-key-quotes
  // @ts-ignore
  "@meta": {
    where: {}
  },
  where(target, w) {
    // console.log([target, w]);
    bindMetadata(this, "where", target, w);
    return this;
  }
  // tslint:enable:object-literal-key-quotes
};

function bindMetadata(data: any, metaKey: string | number, target: string | number, meta: any) {
  data["@meta"][metaKey][target] = meta;
}

function mongoFilter<T>(type: IConstructor<T>) {
  return { ...mongiBuilder };
}

const mongiBuilder: IFilterBuilder<any> = {
  type: undefined as any,
  query(type) {
    this.type = type || this.type;
    return { ...defaultQueryFilter };
  }
};

export const MongoFilter: IFilterCreator = <any>Object.assign(mongoFilter, mongiBuilder);
