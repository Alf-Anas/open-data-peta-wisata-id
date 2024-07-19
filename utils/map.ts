import { getValObject } from ".";
import { GeometryPolygon, ObjectLiteral } from "./geojson.interface";
import maplibregl, { LngLatLike } from "maplibre-gl";
import { parse as WKTParse } from "wellknown";
// @ts-ignore
import shpwrite from "shp-write";
// @ts-ignore
import tokml from "tokml";
import { downloadFile } from ".";

export const getPolygonBoundingBox = (polygon: GeometryPolygon) => {
    const coordinates: [LngLatLike, LngLatLike][] = polygon[0];
    const bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
        // @ts-ignore
    }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
    return bounds;
};

export function propertiesTableDiv(
    props: ObjectLiteral,
    lngLat: [number, number]
) {
    const listRow: string[] = [
        `<tr style='background-color: #dddddd; font-weight: bold'>
      <td>NAMA</td>
      <td>${props?.nama}</td>
    </tr>`,
    ];

    for (const key in props) {
        if (key === "WKT_GEOMETRY" || key === "ogc_fid" || key === "nama")
            continue;
        if (props.hasOwnProperty(key)) {
            const row = `<tr style='${
                listRow.length % 2 === 0 ? "background-color: #dddddd" : ""
            }'>
          <td>${key}</td>
          <td>${props[key]}</td>
        </tr>`;
            listRow.push(row);
        }
    }

    const openGMaps = `<tr style='background-color: #dddddd; font-weight: bold'>
      <td>Open</td>
      <td><a href='${openInGoogleMaps(
          lngLat[0],
          lngLat[1]
      )}' target='_blank'>Google Maps</a></td>
    </tr>`;

    listRow.push(openGMaps);

    return `<table style='border: 1px solid #dddddd'>${listRow.join(
        ""
    )}</table>`;
}

export const TYPE_DOWNLOAD = {
    GEOJSON: "GeoJSON",
    SHP: "ShapeFile (SHP)",
    KML: "Keyhole Markup Language (KML)",
};

export function saveSpatialFile(
    typeDownload: string,
    geojson: ObjectLiteral,
    level: string,
    name: string
) {
    const eName = name + "-" + level;
    if (typeDownload === TYPE_DOWNLOAD.GEOJSON) {
        downloadFile(
            JSON.stringify(geojson),
            "application/json",
            eName,
            "geojson"
        );
    } else if (typeDownload === TYPE_DOWNLOAD.SHP) {
        const options = {
            folder: eName,
            types: {
                point: eName + "_PT",
                polygon: eName + "_PL",
                line: eName + "_LN",
            },
        };
        const shpZip = shpwrite.zip(geojson, options);
        downloadFile(shpZip, "data:text/plain;base64,", eName, "zip", false);
    } else if (typeDownload === TYPE_DOWNLOAD.KML) {
        const kml = tokml(geojson, {
            name: "nama",
            description: "label",
        });
        downloadFile(kml, "text/plain", eName, "kml");
    } else {
        console.error("File Type not exist!");
    }
}

export function wktToGeoJson(tableWKT: ObjectLiteral[], geojsonName: string) {
    const listFeature = tableWKT.map((item) => {
        const geom = WKTParse(getValObject(item, "WKT_GEOMETRY", ""));
        const { WKT_GEOMETRY, ogc_fid, ...props } = item;
        return {
            type: "Feature",
            properties: props,
            geometry: geom,
        };
    });
    const geojson: ObjectLiteral = {
        type: "FeatureCollection",
        name: geojsonName,
        crs: {
            type: "name",
            properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
        },
        features: listFeature,
    };
    return { listFeature, geojson };
}

export const openInGoogleMaps = (
    latitude: number | string,
    longitude: number | string
) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    return url;
};
