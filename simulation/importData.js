import getData from './api'

export default async () => {
  const rawData = await getData()
  const proccessedData = []
  for (const body of rawData) {
    proccessedData.push(processData(body))
  }
  return proccessedData
}

const processData = (rawData) => {
  const sections = rawData.split(/\*{79}/)
  const propertiesTable = sections[1]
  const vectorField = sections[8]

  const properties = parseProperties(propertiesTable)
  const { positions, timestamps } = parseVectorField(vectorField)

  let spaceObject = {
    name: properties.name,
    type: properties.type,
    group: properties.group,
    color: properties.color,
    size: properties.size,
    positions: positions,
    timestamps: timestamps,
  }

  return spaceObject
}

const parseProperties = (table) => {
  let properties = {
    name: "Test",
    type: "planet",
    group: "solar system",
    color: "blue",
    size: 0.5,
  }
  return properties
}

const parseVectorField = (vectorField) => {
  const timestamps = []
  const positions = []
  const lines = vectorField.split("\n").slice(2, -2)
  for (let i = 0; i < lines.length; i += 4) {
    const times = lines[i]
    const linePositions = lines[i + 1]
    const vectors = lines[i + 2]

    let time = times.match(/^\d+\.\d+/)[0]
    time = parseFloat(time) 
    timestamps.push(time)

    const splitPositions = linePositions.match(/-?\d+\.\d+E\+\d\d/g)
    const parsedPositions = splitPositions.map((pos) => {
      let [ num, e ] = pos.split("E")
      num = parseFloat(num)
      e = parseFloat(e)
      num = num * (10 ** e)
      return num
    })
    positions.push({
      "x": parsedPositions[0],
      "y": parsedPositions[1],
      "z": parsedPositions[2],
    })
  }
  return {
    "positions": positions,
    "timestamps": timestamps,
  }
}
