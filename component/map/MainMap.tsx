import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import maplibregl, { Map, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import classes from "./MainMap.module.css";
import { propertiesTableDiv } from "@/utils/map";
import { Spin } from "antd";
import { INITIAL_MAP, LAYER_ID, LAYER_SRC, OSM_STYLE } from "./constant";
import { MainContext } from "@/container/HomePage";
import DataWisataJson from "@/data/data-wisata.json";

export default function MainMap({
    children,
    isLoading,
}: {
    children?: ReactNode;
    isLoading?: boolean;
}) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<Map | null>(null);
    const [lng] = useState(INITIAL_MAP.lon);
    const [lat] = useState(INITIAL_MAP.lat);
    const [zoom] = useState(INITIAL_MAP.zoom);
    const [mapHeight, setMapHeight] = useState("100vh");
    const { selected } = useContext(MainContext);
    const popup = useRef(new maplibregl.Popup({ closeButton: false }));

    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return; // stops map from intializing more than once

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: OSM_STYLE as StyleSpecification,
            center: [lng, lat],
            zoom: zoom,
        });

        map.current.on("load", () => {
            if (!map.current) return;

            map.current.addSource(LAYER_SRC.WISATA_CENTROID, {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: DataWisataJson.map((item) => {
                        return {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [
                                    Number(item.lon),
                                    Number(item.lat),
                                ],
                            },
                            properties: {
                                nama: item.nama,
                                provinsi: item.provinsi,
                                kab_kota: item.kota_kab,
                                no: item.no,
                            },
                        };
                    }),
                },
            });

            map.current.addLayer({
                id: LAYER_ID.WISATA_PT,
                type: "circle",
                source: LAYER_SRC.WISATA_CENTROID,
                paint: {
                    "circle-color": "red",
                    "circle-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        8,
                        2,
                        8.01,
                        3.5,
                        10.01,
                        5,
                    ],
                    "circle-stroke-color": "white",
                    "circle-stroke-width": 2,
                },
            });

            map.current.on("click", LAYER_ID.WISATA_PT, (e) => {
                if (!map.current) return;
                if (!e.features) return;

                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(
                        propertiesTableDiv(e.features[0].properties, [
                            e.lngLat.lat,
                            e.lngLat.lng,
                        ])
                    )
                    .addTo(map.current);
            });

            // Change the cursor to a pointer when the mouse is over the states layer.
            map.current.on("mouseenter", LAYER_ID.WISATA_PT, (e) => {
                if (!map.current) return;
                map.current.getCanvas().style.cursor = "pointer";

                if (!e.features) return;

                const name = e.features[0].properties.nama;
                popup.current
                    .setLngLat(e.lngLat)
                    .setHTML(`<div>${name}</div>`)
                    .addTo(map.current);
            });

            // Change it back to a pointer when it leaves.
            map.current.on("mouseleave", LAYER_ID.WISATA_PT, () => {
                if (!map.current) return;
                map.current.getCanvas().style.cursor = "";
                popup.current.remove();
            });
        });
    }, [lng, lat, zoom]);

    useEffect(() => {
        const headerElement = document.getElementById("public-layout-header");
        const footerElement = document.getElementById("public-layout-footer");

        if (headerElement?.clientHeight && footerElement?.clientHeight) {
            setMapHeight(
                `calc(100vh - ${headerElement.clientHeight}px - ${footerElement.clientHeight}px)`
            );
        }
    }, []);

    useEffect(() => {
        if (!map.current) return;
        if (selected.no) {
            map.current.flyTo({
                center: [Number(selected.lon), Number(selected.lat)],
                essential: true,
                zoom: 14,
            });
        }
    }, [selected]);

    return (
        <div className={classes.map_wrap} style={{ height: mapHeight }}>
            {children}
            {isLoading && <Spin size="large" className={classes.map_loading} />}
            <div ref={mapContainer} className={classes.map} />
        </div>
    );
}
