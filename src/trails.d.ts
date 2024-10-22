declare module 'trails' {
  interface Trail {
    municipality: string;
    area: string;
    name: string;
    route: string;
    description: string;
    type: string;
    grade: string;
    water: string;
    severalRoutes: string;
    surface: string;
    hikingTrail: string;
    parking: string;
    time: string;
    tags: string;
  }
  export const listTrails: Trail[];
}
