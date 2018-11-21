import { IConstructor, tryGetDefine } from "./base";

export const Operator = {
  "=": "$in",
  "!=": "$nin",
  ">": "$gt",
  ">=": "$gte",
  "<": "$lt",
  "<=": "$lte"
};

export interface IQueryWhere<T, TARGET extends keyof T> {
  "="?: Array<T[TARGET]>;
  "!="?: Array<T[TARGET]>;
  ">"?: T[TARGET];
  ">="?: T[TARGET];
  "<"?: T[TARGET];
  "<="?: T[TARGET];
}

export interface IQueryFilter<T> {
  where<TARGET extends keyof T>(target: TARGET, type: "=" | "!=", range: Array<T[TARGET]>): IQueryFilter<T>;
  where<TARGET extends keyof T>(target: TARGET, type: ">" | ">=" | "<" | "<=", value: T[TARGET]): IQueryFilter<T>;
  where<TARGET extends keyof T>(target: TARGET, type: "and" | "or" | "nor", where: IQueryWhere<T, TARGET>): IQueryFilter<T>;
  where<TARGET extends keyof T>(target: TARGET, where: IQueryWhere<T, TARGET>): IQueryFilter<T>;
}

interface IInternalQueryFilter<T> extends IQueryFilter<T> {
  type: IConstructor<T>;
  meta: IFilterMeta<T>;
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
  or: any[];
  nor: any[];
}

const defaultQueryFilter: IInternalQueryFilter<{ [prop: string]: any }> = {
  // tslint:disable:object-literal-key-quotes
  type: undefined as any,
  meta: <IFilterMeta<any>>{
    where: {},
    or: [],
    nor: []
  },
  where(target: any, ...args: any[]) {
    const { preValidator: pre } = tryGetDefine(this.type);
    const metadata = pre.properties;
    const propertyKey = (metadata[target] && metadata[target].alias) || target;
    let [type, where] = args;
    let isWhere = true;
    if (args.length <= 1) {
      where = type || {};
      type = "and";
    } else {
      switch (type) {
        case "=":
        case "!=":
        case ">":
        case "<":
        case ">=":
        case "<=":
          where = { [type]: where };
          type = "and";
          break;
        case "or":
        case "nor":
          isWhere = false;
          break;
        default: break;
      }
    }
    const { meta } = this;
    const { where: where_meta } = meta;
    if (isWhere) {
      where_meta[propertyKey] = {
        ...(where_meta[propertyKey] || {}), ...where
      };
    } else {
      const ormeta = tryGetGroup(meta, <"or" | "nor">type);
      ormeta.push({ [propertyKey]: where });
    }
    return this;
  }
  // tslint:enable:object-literal-key-quotes
};

function tryGetGroup(meta: IFilterMeta<{ [prop: string]: any; }>, type: "or" | "nor") {
  let ormeta = meta[type];
  if (!ormeta) ormeta = meta[type] = [];
  return ormeta;
}

export function readFilterMeta<T>(filter: IQueryFilter<T>): IFilterMeta<T> {
  return (<IInternalQueryFilter<T>>filter).meta;
}

function mongoFilter<T>(type: IConstructor<T>) {
  return { ...mongiBuilder, type };
}

const mongiBuilder: IFilterBuilder<any> = {
  type: undefined as any,
  query(type) {
    this.type = type || this.type;
    return { ...defaultQueryFilter, type: this.type };
  }
};

export const MongoFilter: IFilterCreator = <any>Object.assign(mongoFilter, mongiBuilder);
