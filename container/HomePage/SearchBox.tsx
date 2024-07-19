import { AutoComplete, Form, Input, Typography } from "antd";
import classes from "./SearchBox.module.css";
import { useContext, useEffect, useState } from "react";
import { getValObject } from "@/utils";
import useTermDebounce from "@/hooks/useTermDebounce";
import { MainContext } from ".";
import DataWisataJson from "@/data/data-wisata.json";
import { searchFuzzy, searchIncludes, searchStartsWith } from "@/utils";
import { ObjectLiteral } from "@/utils/geojson.interface";

const emptyData = [{ value: "", label: "-- No Data --" }];
const renderItem = (props: ObjectLiteral) => {
    return {
        key: props.no,
        props,
        value: props.no + "_" + props.nama,
        label: (
            <div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    {props.nama}
                    <span>{props.no}</span>
                </div>
                <Typography.Text
                    type="secondary"
                    style={{ whiteSpace: "break-spaces" }}
                >
                    {props.kota_kab} - {props.provinsi}
                </Typography.Text>
            </div>
        ),
    };
};

function searchWisataData(srcText?: string) {
    if (!srcText) return [];
    let limitLeft = 20;
    const allListSearch: ObjectLiteral[] = [];
    const listSearchStart: ObjectLiteral[] = searchStartsWith(
        DataWisataJson,
        srcText,
        ["nama"],
        limitLeft
    );
    limitLeft = limitLeft - listSearchStart.length;
    allListSearch.push(...listSearchStart);

    const listIncludes: ObjectLiteral[] = searchIncludes(
        DataWisataJson,
        srcText,
        ["nama"],
        limitLeft,
        listSearchStart
    );
    limitLeft = limitLeft - listIncludes.length;
    allListSearch.push(...listIncludes);

    const listFuzzy: ObjectLiteral[] = searchFuzzy(
        DataWisataJson,
        srcText,
        limitLeft,
        allListSearch
    );
    limitLeft = limitLeft - listFuzzy.length;
    allListSearch.push(...listFuzzy);

    return allListSearch;
}

export default function SearchBox() {
    const [listOptions, setListOptions] = useState<any[]>([]);
    const [text, setText] = useState<string>();
    const [term, setTerm] = useTermDebounce<string>();
    const { setSelected } = useContext(MainContext);

    useEffect(() => {
        const filterData = searchWisataData(term);
        const options = filterData.map((item) => renderItem(item));
        setListOptions(options);
    }, [term]);

    function onSelect(_val: string, item: any) {
        setSelected(getValObject(item, "props", {}));
        setText(getValObject(item, "nama", {}));
    }

    return (
        <Form.Item className={classes.custom_search_box}>
            <AutoComplete
                options={listOptions}
                onSelect={onSelect}
                listHeight={450}
                value={text}
            >
                <Input.Search
                    size="large"
                    placeholder="Cari..."
                    onSearch={(val) => setTerm(val)}
                    onChange={(ev) => {
                        setTerm(ev.target.value);
                        setText(ev.target.value);
                    }}
                    allowClear
                />
            </AutoComplete>
        </Form.Item>
    );
}
