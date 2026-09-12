import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { Coordinates } from "@/domain/types";

type Props = {
  origin: Coordinates;
  destination: Coordinates;
  originLabel: string;
  destinationLabel: string;
};

const tileSize = 256;

export function OsmMap({ origin, destination, originLabel, destinationLabel }: Props) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const zoom = chooseZoom(origin, destination);
  const center = {
    latitude: (origin.latitude + destination.latitude) / 2,
    longitude: (origin.longitude + destination.longitude) / 2
  };
  const mapState = useMemo(() => {
    if (layout.width <= 0 || layout.height <= 0) {
      return null;
    }

    const centerPoint = latLonToWorldPixel(center, zoom);
    const topLeft = {
      x: centerPoint.x - layout.width / 2,
      y: centerPoint.y - layout.height / 2
    };
    const startX = Math.floor(topLeft.x / tileSize);
    const endX = Math.floor((topLeft.x + layout.width) / tileSize);
    const startY = Math.floor(topLeft.y / tileSize);
    const endY = Math.floor((topLeft.y + layout.height) / tileSize);
    const maxTile = 2 ** zoom;
    const tiles = [];

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        if (y >= 0 && y < maxTile) {
          const wrappedX = ((x % maxTile) + maxTile) % maxTile;
          tiles.push({
            id: `${zoom}-${wrappedX}-${y}`,
            x: wrappedX,
            y,
            left: x * tileSize - topLeft.x,
            top: y * tileSize - topLeft.y
          });
        }
      }
    }

    return {
      tiles,
      originPoint: pointToViewport(origin, zoom, topLeft, layout),
      destinationPoint: pointToViewport(destination, zoom, topLeft, layout)
    };
  }, [center.latitude, center.longitude, destination, layout, origin, zoom]);

  return (
    <View
      style={styles.map}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
      }}
    >
      {mapState?.tiles.map((tile) => (
        <Image
          key={tile.id}
          source={{ uri: `https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png` }}
          style={[styles.tile, { left: tile.left, top: tile.top }]}
        />
      ))}
      {mapState ? (
        <>
          <Marker point={mapState.originPoint} color="#28836f" label={originLabel} />
          <Marker point={mapState.destinationPoint} color="#c95064" label={destinationLabel} alignRight />
        </>
      ) : null}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Map data © OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}

function Marker({
  point,
  color,
  label,
  alignRight = false
}: {
  point: { left: number; top: number };
  color: string;
  label: string;
  alignRight?: boolean;
}) {
  return (
    <View
      style={[
        styles.markerWrap,
        {
          left: point.left,
          top: point.top
        }
      ]}
    >
      <View style={[styles.pin, { backgroundColor: color }]} />
      <Text style={[styles.markerLabel, alignRight && styles.markerLabelRight]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function chooseZoom(origin: Coordinates, destination: Coordinates) {
  const latDiff = Math.abs(origin.latitude - destination.latitude);
  const lonDiff = Math.abs(origin.longitude - destination.longitude);
  const diff = Math.max(latDiff, lonDiff);

  if (diff < 0.012) return 15;
  if (diff < 0.03) return 14;
  if (diff < 0.08) return 13;
  return 12;
}

function pointToViewport(
  point: Coordinates,
  zoom: number,
  topLeft: { x: number; y: number },
  layout: { width: number; height: number }
) {
  const worldPixel = latLonToWorldPixel(point, zoom);

  return {
    left: clamp(worldPixel.x - topLeft.x, 12, layout.width - 12),
    top: clamp(worldPixel.y - topLeft.y, 24, layout.height - 12)
  };
}

function latLonToWorldPixel(point: Coordinates, zoom: number) {
  const tile = latLonToTile(point, zoom);

  return {
    x: tile.x * tileSize,
    y: tile.y * tileSize
  };
}

function latLonToTile(point: Coordinates, zoom: number) {
  const latRad = (point.latitude * Math.PI) / 180;
  const n = 2 ** zoom;

  return {
    x: ((point.longitude + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const styles = StyleSheet.create({
  map: {
    position: "relative",
    height: 300,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#d9ddd6"
  },
  tiles: {
    display: "none"
  },
  tile: {
    position: "absolute",
    width: tileSize,
    height: tileSize
  },
  markerWrap: {
    position: "absolute",
    maxWidth: 160,
    transform: [{ translateX: -12 }, { translateY: -24 }]
  },
  pin: {
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#25302d",
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  markerLabel: {
    marginTop: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    color: "#25302d",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 7,
    paddingVertical: 4
  },
  markerLabelRight: {
    transform: [{ translateX: -118 }]
  },
  legend: {
    position: "absolute",
    right: 6,
    bottom: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 3
  },
  legendText: {
    color: "#64706d",
    fontSize: 10,
    fontWeight: "700"
  }
});
