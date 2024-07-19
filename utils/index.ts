import MiniSearch from "minisearch";
import { Feature, ObjectLiteral } from "./geojson.interface";

export function safeArray<T = ObjectLiteral>(arr: any, defaultValue = []) {
    if (Array.isArray(arr) && arr.length > 0) {
        return arr as T[];
    }
    return defaultValue as T[];
}

export function safeObject<T = ObjectLiteral>(obj: any, defaultValue = {}) {
    if (!!obj && typeof obj === "object") {
        return obj as T;
    }
    return defaultValue as T;
}

export function safeString(str: any, defaultValue = "") {
    if (!!str && typeof str === "string") {
        return str;
    } else if (typeof str === "number") {
        return String(str);
    }
    return defaultValue;
}

export function safeNumber(num: any, defaultValue = 0) {
    if (typeof num === "number") {
        return num;
    }
    return defaultValue;
}

export function getValObject(obj: any, key = "", defaultValue: any = "") {
    if (!!obj && typeof obj === "object") {
        const splitKey = key.split(".");
        let value: any = obj;
        for (let i = 0; i < splitKey.length; i++) {
            value = safeObject(value)[splitKey[i]];
        }
        return value || defaultValue;
    }
    return defaultValue;
}

export const errorResponse = (err: any) => {
    let msg = "";

    if (err?.response) {
        msg = err?.response?.status + " " + err?.response?.statusText;
        if (err?.response?.data?.message) {
            msg = err?.response?.data?.message;
        }
    } else {
        msg = err;
    }
    return msg;
};

export function downloadFile(
    eData: any,
    type: string,
    fileName: string,
    fileType: string,
    createBlob = true
) {
    if (!eData) return;
    const mBlob = createBlob ? new Blob([eData], { type: type }) : null;
    const fileObjURL = mBlob ? URL.createObjectURL(mBlob) : `${type}${eData}`;
    if (typeof document !== "undefined") {
        const el = document.createElement("a");
        el.setAttribute("href", fileObjURL);
        el.setAttribute("download", fileName + "." + fileType);
        document.body.appendChild(el);
        el.click();
        el.remove();
    }
}

export function searchStartsWith(
    features: ObjectLiteral[],
    txt: string = "",
    listKey: string[] = ["nama"],
    limit: number = 20
): ObjectLiteral[] {
    let count = 0;
    const listSearch: ObjectLiteral[] = features.filter((props) => {
        if (count >= limit) {
            return false;
        }
        let isMatch = false;
        for (const key of listKey) {
            if (props.hasOwnProperty(key)) {
                isMatch = safeString(props[key]).toLowerCase().startsWith(txt);
                if (isMatch) {
                    count++;
                    break;
                }
            }
        }
        return isMatch;
    });

    return listSearch;
}

export function searchIncludes(
    features: ObjectLiteral[],
    txt: string = "",
    listKey: string[] = ["nama"],
    limit: number = 20,
    existingFeatures: ObjectLiteral[]
): ObjectLiteral[] {
    let count = 0;
    const listSearch: ObjectLiteral[] = features.filter((props) => {
        if (count >= limit) {
            return false;
        }
        const findExisting = existingFeatures.find(
            (feat) => feat.no == props.no
        );
        if (findExisting) {
            return false;
        }
        let isIncludes = false;
        for (const key of listKey) {
            if (props.hasOwnProperty(key)) {
                isIncludes = safeString(props[key]).toLowerCase().includes(txt);
                if (isIncludes) {
                    count++;
                    break;
                }
            }
        }
        return isIncludes;
    });

    return listSearch;
}

export function searchFuzzy(
    features: ObjectLiteral[],
    txt: string = "",
    limit: number = 20,
    existingFeatures: ObjectLiteral[]
): ObjectLiteral[] {
    if (limit <= 0) return [];

    const filteringFeatures: ObjectLiteral[] = features.filter((props) => {
        const findExisting = existingFeatures.find(
            (feat) => feat.no == props.no
        );
        if (findExisting) {
            return false;
        }
        return true;
    });

    const newFilter = filteringFeatures.map((item) => {
        return { ...item, id: item.no };
    });

    const miniSearch = new MiniSearch({
        fields: ["search"],
        storeFields: ["nama"],
        searchOptions: {
            fuzzy: 0.3,
        },
    });
    miniSearch.addAll(newFilter);

    const clearTxt = safeString(txt).replaceAll(" ", "");
    const results = miniSearch.search(clearTxt);
    const sortingResults = results
        .sort((a, b) => b.score - a.score)
        .splice(0, limit);

    return sortingResults as unknown as ObjectLiteral[];
}
