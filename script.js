const req = new XMLHttpRequest()
req.open("GET","https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",true)
req.send()
let json
let dataset
req.onload = function() {
  json = JSON.parse(req.responseText)
  dataset = json.monthlyVariance
}

d3.select("body")
  .append("h1")
  .text("Monthly Global Land-Surface Temperature")
  .attr("id","title")

d3.select("body")
  .append("h2")
  .text("1753-2015: base temperature 8.66 degrees C")
  .attr("id","description")

setTimeout(() => {
  const cellWidth = 5.5
  const w = (d3.max(dataset,(d) => d.year) - d3.min(dataset,(d) => d.year) + 1) * cellWidth
  const h = 450
  const padding = 80
  const baseColors = [
    '#4575b4',
    '#ffffbf',
    '#d73027'
  ]

  let svg = d3.select("body")
    .append("svg")
    .attr("width",w + 2 * padding)
    .attr("height",h + 2 * padding)

  const dMonth = dataset.map(d => d.month)
  const removeDuplicates = (array) => {
    const result = []
    result.push(array[0])
    
    for (let i = 1; i < array.length; i++) {
      let counter = 0
      for (let j = 0; j < result.length; j++) {
        if (array[i] == result[j]) {
          counter++
        }
      }

      if (counter == 0) {
        result.push(array[i])
      }
    }

    return result
  }
  const yValues = removeDuplicates(dMonth)
  const yScale = d3.scaleBand()
    .domain(yValues.map((d) => d3.timeParse("%m")(d)))
    .range([0,h])
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat("%B"))
  svg.append("g")
    .attr("transform","translate(" + padding + "," + padding + ")")
    .attr("id","y-axis")
    .call(yAxis)
  
  const yearMax = d3.max(dataset,d => d.year)
  const yearMin = d3.min(dataset,d => d.year)
  const xScale = d3.scaleTime()
    .domain([new Date(yearMin.toString()),new Date((yearMax + 1).toString())])
    .range([0,w])
  const xAxis = d3.axisBottom(xScale)
  svg.append("g")
    .attr("transform","translate(" + padding + "," + (padding + h) + ")")
    .attr("id","x-axis")
    .call(xAxis)

  const varianceMin = d3.min(dataset,(d) => d.variance)
  const varianceMax = d3.max(dataset,(d) => d.variance)
  const varianceMid = (varianceMax + varianceMin)/2
  const colorScale = d3.scaleLinear()
    .domain([varianceMin,varianceMid,varianceMax])
    .range([baseColors[0],baseColors[1],baseColors[2]])

  const cellHeight = yScale(d3.timeParse("%m")(2)) - yScale(d3.timeParse("%m")(1))
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
      .attr("width",cellWidth)
      .attr("height",cellHeight)
      .attr("x",(d) => xScale(new Date(d.year.toString())) + padding)
      .attr("y",(d) => yScale(d3.timeParse("%m")(d.month)) + padding)
      .attr("class","cell")
      .attr("data-month",(d) => d.month)
      .attr("data-year",(d) => d.year)
      .attr("data-temp",(d) => d.variance + json.baseTemperature)
      .style("fill",(d) => colorScale(d.variance))

},1000)