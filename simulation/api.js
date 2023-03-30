import axios from 'axios'

const majorBodies = [
   // "10",  // Sun
  // "199",  // Mercury
  // "299",  // Venus
  "399",  // Earth
  // "499",  // Mars
  // "599",  // Jupiter
  // "699",  // Saturn
  // "799",  // Uranus
  // "899",  // Nepture
]

const getBodyData = async (body) => {
  let instance = axios.create({
    baseURL: 'https://ssd.jpl.nasa.gov/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  try {
    const response = await instance.get("/horizons.api", {
      params: {
        format: "json",
        COMMAND: body,
        EPHEM_TYPE: "VECTORS",
        CENTER: "500@0",
        START_TIME: "2000-01-01",
        STOP_TIME: "2010-01-01",
        STEP_SIZE: "1d",
      }
    })
    const data = response.data.result
    return data
  } catch(err) {
    console.log(err)
  }
};

export default async () => {
  const bodiesData = []
  for (const body of majorBodies) {
    bodiesData.push(await getBodyData(body))
  }
  return bodiesData;
}
