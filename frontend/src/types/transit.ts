export type StopStatus = 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
export type RouteStatus = 'ACTIVE' | 'DELAYED' | 'CHANGED' | 'SUSPENDED';

export interface Stop {
  id: string;
  name: string;
  address: string;
  zone: string;
  status: StopStatus;
  accessible: boolean;
  amenities: string[];
  coords: { x: number; y: number };
  routeIds: string[];
}

export interface StopRoute {
  id: string;
  name: string;
  status: RouteStatus;
  active: boolean;
  nextDestinationStopId: string | null;
}

export type PlaceCategory = 'PARK' | 'CULTURE' | 'SHOPPING' | 'HEALTH' | 'SPORTS' | 'EDUCATION';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  nearStopId: string;
  coords: { x: number; y: number };
}

export interface StopDetail extends Stop {
  routes: StopRoute[];
  places: Pick<Place, 'id' | 'name' | 'category'>[];
}

export interface NearbyStop {
  stopId: string;
  name: string;
  status: StopStatus;
  accessible: boolean;
  distanceMeters: number;
  walkingMinutes: number;
}

export interface NearbyStopsResult {
  place: Place;
  stops: NearbyStop[];
}

export interface RouteStop {
  stopId: string;
  name: string;
  minutesFromStart: number;
}

export interface Route {
  id: string;
  name: string;
  originStopId: string;
  destinationStopId: string;
  stops: RouteStop[];
  stopCount: number;
  estimatedMinutes: number;
  status: RouteStatus;
  color: string;
  active: boolean;
}

export type AlertLevel = 'NORMAL' | 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertType = 'DELAY' | 'ROUTE_CHANGE' | 'INTERRUPTION' | 'INFORMATION';

export interface Alert {
  id: string;
  level: AlertLevel;
  type: AlertType;
  routeId: string | null;
  routeName: string | null;
  title: string;
  message: string;
  active: boolean;
  publishedAt: string;
}

export type BusStatus = 'IN_SERVICE' | 'AT_TERMINAL' | 'OUT_OF_SERVICE';

export interface BusPosition {
  minute: number;
  fromStopId: string;
  toStopId: string;
  x: number;
  y: number;
}

export interface Bus {
  id: string;
  plate: string;
  routeId: string;
  routeName: string;
  capacity: number;
  /** Live status at `tick`. */
  status: BusStatus;
  startMinute: number;
  delayMinutes: number;
  position: BusPosition | null;
  locationText: string;
  nextStopId: string | null;
  nextStopName: string | null;
  etaMinutes: number | null;
  tick: number;
  lastUpdate: string;
  lastUpdateTime: string;
}

export interface Arrival {
  busId: string;
  routeId: string;
  routeName: string;
  etaMinutes: number;
  delayMinutes: number;
}

export interface StopArrivals {
  stopId: string;
  stopName: string;
  served: boolean;
  clock: { tick: number; timestamp: string; time: string };
  arrivals: Arrival[];
}

export interface RouteSegment {
  routeId: string;
  routeName: string;
  color: string;
  status: RouteStatus;
  fromStopId: string;
  fromName: string;
  toStopId: string;
  toName: string;
  minutes: number;
  stopCount: number;
  stops: RouteStop[];
}

export type TripTag = 'DIRECT' | 'FASTEST' | 'FEWEST_TRANSFERS';

export interface TripOption {
  id: string;
  legs: RouteSegment[];
  transfers: number;
  transferStops: { stopId: string; name: string }[];
  travelMinutes: number;
  waitingMinutes: number;
  totalMinutes: number;
  totalStops: number;
  recommended: boolean;
  tags: TripTag[];
}

export interface TripPlan {
  origin: { stopId: string; name: string };
  destination: { stopId: string; name: string };
  transferWaitMinutes: number;
  options: TripOption[];
}

export interface RouteSearchResult {
  routeId: string;
  name: string;
  color: string;
  status: RouteStatus;
  originStopId: string;
  originName: string;
  destinationStopId: string;
  destinationName: string;
  estimatedMinutes: number;
  stopCount: number;
  stops: RouteStop[];
}
