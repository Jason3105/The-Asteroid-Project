export function solveKepler(meanAnomalyRad: number, eccentricity: number, tol = 1e-10, maxIter = 100): number {
  let E = meanAnomalyRad;
  for (let i = 0; i < maxIter; i++) {
    const f = E - eccentricity * Math.sin(E) - meanAnomalyRad;
    const fPrime = 1.0 - eccentricity * Math.cos(E);
    const ENew = E - f / fPrime;
    if (Math.abs(ENew - E) < tol) return ENew;
    E = ENew;
  }
  return E;
}

export function keplerToCartesian(
  semiMajorAxisAu: number,
  eccentricity: number,
  inclinationDeg: number,
  longAscNodeDeg: number,
  argPerihelionDeg: number,
  meanAnomalyDeg: number
) {
  const a = semiMajorAxisAu;
  const e = eccentricity;
  const i = (inclinationDeg * Math.PI) / 180.0;
  const Omega = (longAscNodeDeg * Math.PI) / 180.0;
  const omega = (argPerihelionDeg * Math.PI) / 180.0;
  const M = (meanAnomalyDeg * Math.PI) / 180.0;

  const E = solveKepler(M, e);

  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosBigOmega = Math.cos(Omega);
  const sinBigOmega = Math.sin(Omega);

  const x =
    (cosBigOmega * cosOmega - sinBigOmega * sinOmega * cosI) * xOrb +
    (-cosBigOmega * sinOmega - sinBigOmega * cosOmega * cosI) * yOrb;
  const y =
    (sinBigOmega * cosOmega + cosBigOmega * sinOmega * cosI) * xOrb +
    (-sinBigOmega * sinOmega + cosBigOmega * cosOmega * cosI) * yOrb;
  const z = (sinOmega * sinI) * xOrb + (cosOmega * sinI) * yOrb;

  return { x, y, z };
}

export function orbitPoints(
  semiMajorAxisAu: number,
  eccentricity: number,
  inclinationDeg: number,
  longAscNodeDeg: number,
  argPerihelionDeg: number,
  nPoints = 360
) {
  const points = [];
  for (let idx = 0; idx < nPoints; idx++) {
    const M = (360.0 * idx) / nPoints;
    const pos = keplerToCartesian(
      semiMajorAxisAu,
      eccentricity,
      inclinationDeg,
      longAscNodeDeg,
      argPerihelionDeg,
      M
    );
    points.push(pos);
  }
  return points;
}

export function hohmannDeltaV(r1Au: number, r2Au: number) {
  const r1 = r1Au * 149597870.7; // AU to KM
  const r2 = r2Au * 149597870.7;
  const mu = 132712440018.0; // SUN_MU km^3/s^2

  const v1 = Math.sqrt(mu / r1);
  const v2 = Math.sqrt(mu / r2);
  const vTransfer1 = Math.sqrt(mu * (2 / r1 - 1 / ((r1 + r2) / 2)));
  const vTransfer2 = Math.sqrt(mu * (2 / r2 - 1 / ((r1 + r2) / 2)));

  const dv1 = Math.abs(vTransfer1 - v1);
  const dv2 = Math.abs(v2 - vTransfer2);
  return dv1 + dv2;
}
