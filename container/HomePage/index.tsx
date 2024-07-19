import MainMap from "@/component/map/MainMap";
import SearchBox from "./SearchBox";
import { createContext, useState } from "react";
import { ObjectLiteral } from "@/utils/geojson.interface";

export type MainContextType = {
    selected: ObjectLiteral;
    setSelected: (_args: any) => void;
};

export const MainContext = createContext<MainContextType>({
    selected: {} as ObjectLiteral,
    setSelected: (_args: any) => {},
});

export default function HomePage() {
    const [selected, setSelected] = useState<ObjectLiteral>(
        {} as ObjectLiteral
    );

    return (
        <MainContext.Provider
            value={{
                selected,
                setSelected,
            }}
        >
            <MainMap>
                <SearchBox />
            </MainMap>
        </MainContext.Provider>
    );
}
